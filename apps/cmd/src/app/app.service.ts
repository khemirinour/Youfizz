import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { ILike, Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { QueryOrdersDto } from '../dto/query-orders.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Order) private readonly repo: Repository<Order>,
  ) {}

  findAll(query: QueryOrdersDto) {
    const where: any = {};
    if (query.search) where.number = ILike(`%${query.search}%`);
    if (query.status) where.status = query.status;
    if (query.customerName) where.customerName = ILike(`%${query.customerName}%`);
    if (query.customerEmail) where.customerEmail = ILike(`%${query.customerEmail}%`);
    if (query.customerPhone) where.customerPhone = ILike(`%${query.customerPhone}%`);
    if (query.vendorId) where.vendorId = query.vendorId;
    if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
    return this.repo.find({ where, take: query.limit, skip: query.offset, order: { createdAt: 'DESC' } });
  }

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }

  async create(data: Partial<Order>) {
    const lastOrders = await this.repo.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    if (lastOrders.length > 0) {
      const lastOrder = lastOrders[0];
      const lastNumber = parseInt(lastOrder.number.split('-')[1]);
      data.number = `ORDER-${(lastNumber + 1).toString().padStart(3, '0')}`;
    } else {
      data.number = 'ORDER-001';
    }
    
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.repo.update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete({ id });
    return { id };
  }

  async setActive(id: string, active: boolean) {
    await this.repo.update({ id }, { isActive: active });
    return this.findOne(id);
  }

  async confirm(id: string, confirmer?: { userId?: string; role?: string; vendorId?: string; confirmateurId?: string }) {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Enforce vendor quota via auth internal APIs: check (GET) then consume (POST)
    if (confirmer?.role === 'VENDEUR' || confirmer?.role === 'CONFIRMATEUR') {
      if (order.vendorId && order.vendorId !== confirmer.vendorId) {
        throw new ForbiddenException();
      }

      // Use same logic as login token: get user ID and vendor ID from token
      const vendorUserId = confirmer.userId; // userId from token (same as login logic)
      const vendorId = confirmer.vendorId;   // vendorId from token (same as login logic)
      
      try {
        // 1) Check remaining via GET
        const params: any = vendorId ? { vendorId } : { vendorUserId };
        const check = await axios.get('http://localhost:3001/api/internal/vendors/confirm-quota', {
          params,
          timeout: 5000,
        });
        if (!check?.data || typeof check.data.remaining !== 'number' || check.data.remaining <= 0) {
          throw { statusCode: 403, message: 'Vendor has no remaining confirmations' };
        }
        // 2) Consume quota via POST to keep atomicity on auth side
        const body: any = vendorId ? { vendorId } : { vendorUserId };
        await axios.post('http://localhost:3001/api/internal/vendors/confirm-quota/consume', body, { timeout: 5000 });
      } catch (e: any) {
        throw e?.response?.data ?? e;
      }
    }
    await this.repo.update({ id }, { status: OrderStatus.CONFIRMED, isActive: true });
    return this.findOne(id);
  }

  async getOrderStats() {
    const [total, byStatus, paidCount, unpaidCount, activeCount, inactiveCount] = await Promise.all([
      this.repo.count(),
      this.repo
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('order.status')
        .getRawMany(),
      this.repo.count({ where: { isPaid: true } }),
      this.repo.count({ where: { isPaid: false } }),
      this.repo.count({ where: { isActive: true } }),
      this.repo.count({ where: { isActive: false } }),
    ]);

    const byStatusMap: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      byStatusMap[item.status] = parseInt(item.count, 10);
    });

    // Calculate total revenue (sum of all order totals)
    const revenueResult = await this.repo
      .createQueryBuilder('order')
      .select('SUM(order.total::numeric)', 'total')
      .getRawOne();
    const totalRevenue = revenueResult?.total ? parseFloat(revenueResult.total) : 0;

    return {
      total,
      byStatus: byStatusMap,
      paid: paidCount,
      unpaid: unpaidCount,
      active: activeCount,
      inactive: inactiveCount,
      totalRevenue,
    };
  }
}
