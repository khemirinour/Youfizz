import { Injectable } from '@nestjs/common';
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
    if (query.customerId) where.customerId = query.customerId;
    if (query.vendorId) where.vendorId = query.vendorId;
    if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
    return this.repo.find({ where, take: query.limit, skip: query.offset, order: { createdAt: 'DESC' } });
  }

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }

  async create(data: Partial<Order>) {
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

  async confirm(id: string, confirmer?: { id?: string; role?: string; vendorId?: string }) {
    // If confirmer is vendor or confirmateur, enforce vendor quota via auth internal endpoint
    if (confirmer?.role === 'VENDEUR' || confirmer?.role === 'CONFIRMATEUR') {
      const body: any = {};
      if (confirmer.vendorId) body.vendorId = confirmer.vendorId;
      else if (confirmer.id) body.vendorUserId = confirmer.id;
      try {
        await axios.post('http://localhost:3001/api/internal/vendors/confirm-quota/consume', body, { timeout: 5000 });
      } catch (e: any) {
        throw e?.response?.data ?? e;
      }
    }
    await this.repo.update({ id }, { status: OrderStatus.CONFIRMED, isActive: true });
    return this.findOne(id);
  }
}


