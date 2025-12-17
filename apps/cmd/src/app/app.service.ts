import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { ILike, Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { QueryOrdersDto } from '../dto/query-orders.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectRepository(Order) private readonly repo: Repository<Order>,
  ) {}

  async findAll(query: QueryOrdersDto) {
    const where: any = {};
    if (query.search) where.number = ILike(`%${query.search}%`);
    if (query.status) where.status = query.status;
    if (query.customerName) where.customerName = ILike(`%${query.customerName}%`);
    if (query.customerEmail) where.customerEmail = ILike(`%${query.customerEmail}%`);
    if (query.customerPhone) where.customerPhone = ILike(`%${query.customerPhone}%`);
    // vendorId is now required, always set it in the where clause
    where.vendorId = query.vendorId;
    if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
    
    const orders = await this.repo.find({ where, take: query.limit, skip: query.offset, order: { createdAt: 'DESC' } });
    
    // Check vendor's nbrCmdConf - get vendorId from filter
    let shouldHideCustomerInfo = false;
    try {
      const quotaCheck = await axios.get('http://localhost:3001/api/internal/vendors/confirm-quota', {
        params: { vendorId: query.vendorId },
        timeout: 5000,
      });
      
      // If vendor's nbrCmdConf is 0, check if we should hide customer information
      if (!quotaCheck?.data || quotaCheck.data.remaining === 0) {
        this.logger.log(`Vendor ${query.vendorId} has nbrCmdConf = 0, checking order statuses for customer info hiding`);
        shouldHideCustomerInfo = true;
      }
    } catch (e: any) {
      this.logger.warn(`Failed to check vendor quota for ${query.vendorId}:`, {
        error: e?.message,
        status: e?.response?.status,
      });
      // If we can't check quota, hide customer info for safety
      shouldHideCustomerInfo = true;
    }
    
    // If nbrCmdConf is 0 AND status is not CONFIRMED, remove customer information from orders
    if (shouldHideCustomerInfo) {
      return orders.map(order => {
        // Only hide customer info if status is NOT CONFIRMED
        if (order.status !== OrderStatus.CONFIRMED) {
          const { customerName, customerEmail, customerPhone, customerAddress, ...orderWithoutCustomer } = order;
          return orderWithoutCustomer;
        }
        // If status is CONFIRMED, return order with customer info
        return order;
      });
    }
    
    return orders;
  }

  async findOne(id: string) {
    const order = await this.repo.findOne({ where: { id } });
    
    if (!order) {
      return null;
    }

    // Check vendor's nbrCmdConf from the order's vendorId in the database
    let shouldHideCustomerInfo = false;
    if (order.vendorId) {
      try {
        const quotaCheck = await axios.get('http://localhost:3001/api/internal/vendors/confirm-quota', {
          params: { vendorId: order.vendorId },
          timeout: 5000,
        });
        
        // If vendor's nbrCmdConf is 0, check if we should hide customer information
        if (!quotaCheck?.data || quotaCheck.data.remaining === 0) {
          this.logger.log(`Vendor ${order.vendorId} has nbrCmdConf = 0, checking order status for customer info hiding for order ${id}`);
          shouldHideCustomerInfo = true;
        }
      } catch (e: any) {
        this.logger.warn(`Failed to check vendor quota for order ${id}:`, {
          error: e?.message,
          status: e?.response?.status,
          vendorId: order.vendorId,
        });
        // If we can't check quota, hide customer info for safety
        shouldHideCustomerInfo = true;
      }
    }
    
    // Enrich items with article details
    if (order.items && order.items.length > 0) {
      const enrichedItems = await Promise.all(
        order.items.map(async (item) => {
          try {
            // Fetch article details from article service
            const articleResponse = await axios.get(`http://localhost:3004/api/articles/${item.articleId}`, {
              timeout: 5000,
            });
            
            if (articleResponse.data) {
              const article = articleResponse.data;
              return {
                ...item,
                article: {
                  id: article.id,
                  title: article.title,
                  description: article.description,
                  images: article.images || [],
                  sku: article.sku,
                  status: article.status,
                  isActive: article.isActive,
                },
              };
            }
          } catch (e: any) {
            this.logger.warn(`Failed to fetch article details for ${item.articleId}:`, {
              error: e?.message,
              status: e?.response?.status,
            });
            // Return item without article details if fetch fails
            return {
              ...item,
              article: null,
            };
          }
        })
      );
      
      // Return order with enriched items
      const enrichedOrder = {
        ...order,
        items: enrichedItems,
      };
      
      // If nbrCmdConf is 0 AND status is not CONFIRMED, remove customer information
      if (shouldHideCustomerInfo && enrichedOrder.status !== OrderStatus.CONFIRMED) {
        const { customerName, customerEmail, customerPhone, customerAddress, ...orderWithoutCustomer } = enrichedOrder;
        return orderWithoutCustomer;
      }
      
      return enrichedOrder;
    }
    
    // If nbrCmdConf is 0 AND status is not CONFIRMED, remove customer information
    if (shouldHideCustomerInfo && order.status !== OrderStatus.CONFIRMED) {
      const { customerName, customerEmail, customerPhone, customerAddress, ...orderWithoutCustomer } = order;
      return orderWithoutCustomer;
    }
    
    return order;
  }

  async create(dto: CreateOrderDto) {
    // Calculate total including delivery prices
    // Delivery is per order (not per item), so multiply by 1
    const calculatedTotal = dto.items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.price) * item.qty;
      const deliveryTotal = item.hasDelivery && item.deliveryPrice 
        ? parseFloat(item.deliveryPrice) * 1 
        : 0;
      return sum + itemTotal + deliveryTotal;
    }, 0);

    // Validate that provided total matches calculated total (with small tolerance for floating point)
    const providedTotal = parseFloat(dto.total);
    const difference = Math.abs(calculatedTotal - providedTotal);
    if (difference > 0.01) {
      this.logger.warn(`Order total mismatch: provided ${dto.total}, calculated ${calculatedTotal.toFixed(2)}`);
      // Use calculated total for accuracy
    }

    // Validate delivery information if provided
    for (const item of dto.items) {
      if (item.hasDelivery) {
        if (!item.destination) {
          throw new BadRequestException(`Item with articleId ${item.articleId} has delivery enabled but no destination provided`);
        }
        if (!item.deliveryPrice) {
          throw new BadRequestException(`Item with articleId ${item.articleId} has delivery enabled but no deliveryPrice provided`);
        }
      }
    }

    const lastOrders = await this.repo.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    const orderData: Partial<Order> = {
      items: dto.items,
      total: calculatedTotal.toFixed(2),
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      customerAddress: dto.customerAddress,
      vendorId: dto.vendorId,
      remarque: dto.remarque,
    };

    if (lastOrders.length > 0) {
      const lastOrder = lastOrders[0];
      const lastNumber = parseInt(lastOrder.number.split('-')[1]);
      orderData.number = `ORDER-${(lastNumber + 1).toString().padStart(3, '0')}`;
    } else {
      orderData.number = 'ORDER-001';
    }
    
    const entity = this.repo.create(orderData);
    return this.repo.save(entity);
  }

  // Helper method to get user information
  // Returns userName in "firstname lastname" format
  private async getUserInfo(updater?: { userId?: string; firstName?: string; lastName?: string; email?: string }): Promise<{ userName?: string; userEmail?: string }> {
    let userName: string | undefined;
    let userEmail: string | undefined;

    // Use data from updater if available - format as "firstname lastname"
    if (updater?.firstName || updater?.lastName) {
      const firstName = (updater.firstName || '').trim();
      const lastName = (updater.lastName || '').trim();
      // Ensure proper "firstname lastname" format with space
      userName = `${firstName} ${lastName}`.trim() || undefined;
    }

    if (updater?.email) {
      userEmail = updater.email;
    }

    // If we don't have user info and userId is available, try to fetch from API
    if (updater?.userId && !userName) {
      try {
        this.logger.log(`Fetching user info for userId: ${updater.userId}`);
        // Try auth service directly first (service-to-service)
        const authServicePort = process.env.AUTH_SERVICE_PORT || '3001';
        const authServiceHost = process.env.AUTH_SERVICE_HOST || 'localhost';
        const authServiceUrl = `http://${authServiceHost}:${authServicePort}`;
        
        let userResponse;
        let lastError: any;
        
        try {
          // Try direct auth service call first
          userResponse = await axios.get(`${authServiceUrl}/users/${updater.userId}`, {
            timeout: 5000,
          });
        } catch (directError: any) {
          lastError = directError;
          // If direct call fails with 401, it's an auth issue - skip retry
          if (directError?.response?.status === 401) {
            this.logger.warn(`Auth service requires authentication for userId ${updater.userId}, skipping user info fetch`);
            throw directError;
          }
          
          // If direct call fails for other reasons, try through API gateway
          const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
          this.logger.log(`Direct auth service call failed, trying API gateway: ${apiGatewayUrl}`);
          
          try {
            userResponse = await axios.get(`${apiGatewayUrl}/api/auth/users/${updater.userId}`, {
              timeout: 5000,
            });
          } catch (gatewayError: any) {
            // If gateway also returns 401, it's an auth issue - skip retry
            if (gatewayError?.response?.status === 401) {
              this.logger.warn(`API gateway requires authentication for userId ${updater.userId}, skipping user info fetch`);
              throw gatewayError;
            }
            throw gatewayError;
          }
        }
        
        if (userResponse?.data) {
          const firstName = (userResponse.data.firstName || '').trim();
          const lastName = (userResponse.data.lastName || '').trim();
          // Format as "firstname lastname" with space
          userName = `${firstName} ${lastName}`.trim() || undefined;
          
          if (userName) {
            this.logger.log(`Retrieved userName: "${userName}" for userId: ${updater.userId}`);
          }
          
          if (!userEmail && userResponse.data.email) {
            userEmail = userResponse.data.email;
            this.logger.log(`Retrieved userEmail: ${userEmail} for userId: ${updater.userId}`);
          }
        }
      } catch (e: any) {
        // Handle 401 errors gracefully - service-to-service calls may not have auth
        if (e?.response?.status === 401) {
          this.logger.warn(`Cannot fetch user info for userId ${updater.userId} - authentication required. Continuing without user name.`);
        } else {
          this.logger.warn(`Failed to fetch user info for userId ${updater.userId}:`, {
            error: e?.message,
            status: e?.response?.status,
            statusText: e?.response?.statusText,
          });
        }
      }
    }

    // If we still don't have email, use from updater
    if (!userEmail && updater?.email) {
      userEmail = updater.email;
    }

    // Final fallback: if we have email but no userName, use email username
    // But prefer to keep it null if we can't get the actual name
    if (!userName && userEmail) {
      userName = userEmail.split('@')[0];
      this.logger.log(`Using email username as fallback for userName: ${userName}`);
    }

    return { userName, userEmail };
  }

  async update(id: string, dto: UpdateOrderDto, updater?: { userId?: string; firstName?: string; lastName?: string; email?: string }) {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Always increment confirmation attempts on any update/PATCH
    const currentAttempts = (order.confirmationAttempts || 0) + 1;
    
    // Always get user information for any update/PATCH
    const { userName, userEmail } = await this.getUserInfo(updater);
    
    // Always update user who made the modification on any update/PATCH
    (dto as any).confirmationAttempts = currentAttempts;
    (dto as any).confirmedByUserId = updater?.userId;
    (dto as any).confirmedByUserName = userName;
    (dto as any).confirmedByUserEmail = userEmail;
    (dto as any).lastConfirmationAttemptAt = new Date();

    // If items are being updated, recalculate total including delivery prices
    // Delivery is per order (not per item), so multiply by 1
    if (dto.items && dto.items.length > 0) {
      const calculatedTotal = dto.items.reduce((sum, item) => {
        const itemTotal = parseFloat(item.price) * item.qty;
        const deliveryTotal = item.hasDelivery && item.deliveryPrice 
          ? parseFloat(item.deliveryPrice) * 1 
          : 0;
        return sum + itemTotal + deliveryTotal;
      }, 0);

      // Validate delivery information if provided
      for (const item of dto.items) {
        if (item.hasDelivery) {
          if (!item.destination) {
            throw new BadRequestException(`Item with articleId ${item.articleId} has delivery enabled but no destination provided`);
          }
          if (!item.deliveryPrice) {
            throw new BadRequestException(`Item with articleId ${item.articleId} has delivery enabled but no deliveryPrice provided`);
          }
        }
      }

      dto.total = calculatedTotal.toFixed(2);
    }

    await this.repo.update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete({ id });
    return { id };
  }

  async setActive(id: string, active: boolean, updater?: { userId?: string; firstName?: string; lastName?: string; email?: string }) {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Increment confirmation attempts on activate/deactivate
    const currentAttempts = (order.confirmationAttempts || 0) + 1;
    
    // Get user information for activate/deactivate
    const { userName, userEmail } = await this.getUserInfo(updater);
    
    await this.repo.update({ id }, { 
      isActive: active,
      confirmationAttempts: currentAttempts,
      lastConfirmationAttemptAt: new Date(),
      confirmedByUserId: updater?.userId,
      confirmedByUserName: userName,
      confirmedByUserEmail: userEmail,
    });
    return this.findOne(id);
  }

  async confirm(id: string, confirmer?: { userId?: string; role?: string; vendorId?: string; confirmateurId?: string; firstName?: string; lastName?: string; email?: string }, notes?: string) {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Increment confirmation attempts and update last attempt timestamp on every attempt
    const currentAttempts = (order.confirmationAttempts || 0) + 1;
    await this.repo.update({ id }, {
      confirmationAttempts: currentAttempts,
      lastConfirmationAttemptAt: new Date(),
    });

    // Check if order is already confirmed
    if (order.status === OrderStatus.CONFIRMED) {
      throw new BadRequestException('Order is already confirmed');
    }

    // DEBUG: Log what we received
    this.logger.log(`Confirm order ${id} - confirmer: ${JSON.stringify(confirmer)}`);

    // Enforce vendor quota via auth internal APIs: check (GET) then consume (POST)
    // Make role comparison case-insensitive to handle both 'CONFERMATEUR' and 'confermateur'
    const role = confirmer?.role?.toUpperCase();
    this.logger.log(`Role check - original: ${confirmer?.role}, uppercase: ${role}`);
    
    if (role === 'VENDEUR' || role === 'CONFERMATEUR') {
      // Determine the vendorId to use: prefer from confirmer, then from order, then from token
      const vendorId = confirmer.vendorId || order.vendorId;
      const vendorUserId = confirmer.userId; // userId from token
      
      this.logger.log(`Confirming order ${id} - vendorId: ${vendorId}, vendorUserId: ${vendorUserId}, role: ${confirmer.role}`);
      
      // For VENDEUR: ensure they can only confirm their own orders
      if (role === 'VENDEUR' && order.vendorId && order.vendorId !== confirmer.vendorId) {
        throw new ForbiddenException('You can only confirm orders for your own vendor account');
      }

      // Ensure we have either vendorId or vendorUserId for the quota check
      if (!vendorId && !vendorUserId) {
        this.logger.error(`Missing vendorId and vendorUserId for order ${id}`);
        throw new BadRequestException('Vendor ID is required to confirm order');
      }
      
      try {
        // 1) Check remaining via GET
        const params: any = vendorId ? { vendorId } : { vendorUserId };
        this.logger.log(`Checking quota with params: ${JSON.stringify(params)}`);
        
        const check = await axios.get('http://localhost:3001/api/internal/vendors/confirm-quota', {
          params,
          timeout: 5000,
        });
        
        this.logger.log(`Quota check response: ${JSON.stringify(check.data)}`);
        
        if (!check?.data || typeof check.data.remaining !== 'number' || check.data.remaining <= 0) {
          this.logger.warn(`No remaining confirmations for vendor. Response: ${JSON.stringify(check.data)}`);
          throw { statusCode: 403, message: 'Vendor has no remaining confirmations' };
        }
        
        // 2) Consume quota via POST to keep atomicity on auth side
        const body: any = vendorId ? { vendorId } : { vendorUserId };
        this.logger.log(`Consuming quota with body: ${JSON.stringify(body)}`);
        
        const consumeResponse = await axios.post('http://localhost:3001/api/internal/vendors/confirm-quota/consume', body, { 
          timeout: 5000 
        });
        
        this.logger.log(`Quota consumed successfully. Response: ${JSON.stringify(consumeResponse.data)}`);
        
      } catch (e: any) {
        this.logger.error(`Error during quota check/consume for order ${id}:`, {
          error: e?.message,
          response: e?.response?.data,
          status: e?.response?.status,
          vendorId,
          vendorUserId,
        });
        
        // Re-throw with proper error format - THIS MUST PREVENT ORDER CONFIRMATION
        if (e?.response?.data) {
          throw e.response.data;
        }
        if (e?.statusCode) {
          throw e;
        }
        throw new ForbiddenException(e?.message || 'Failed to check or consume vendor quota');
      }
    } else {
      // Log when role doesn't match (for debugging)
      this.logger.warn(`Order confirmation skipped quota check - role: ${confirmer?.role}, expected VENDEUR or CONFERMATEUR`);
    }
    
    // Get user information using helper method
    const { userName, userEmail } = await this.getUserInfo(confirmer);

    // Only update order status if quota was successfully consumed (or if role doesn't require quota)
    this.logger.log(`Updating order ${id} status to CONFIRMED`);
    const updateData: any = { 
      status: OrderStatus.CONFIRMED, 
      isActive: true,
      confirmationAttempts: currentAttempts, // Ensure we preserve the incremented value
      confirmedByUserId: confirmer?.userId,
      confirmedByUserName: userName,
      confirmedByUserEmail: userEmail,
    };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    await this.repo.update({ id }, updateData);
    
    // Decrement article stock for each item in the order
    if (order.items && order.items.length > 0) {
      this.logger.log(`Decrementing stock for ${order.items.length} item(s) in order ${id}`);
      
      for (const item of order.items) {
        try {
          // Get current article stock using internal endpoint (article service runs on port 3004)
          const articleResponse = await axios.get(`http://localhost:3004/api/internal/articles/${item.articleId}`, {
            timeout: 5000,
          });
          
          if (articleResponse.data) {
            const currentStock = articleResponse.data.stock || 0;
            const newStock = Math.max(0, currentStock - item.qty); // Prevent negative stock
            
            this.logger.log(`Updating stock for article ${item.articleId}: ${currentStock} -> ${newStock} (qty: ${item.qty})`);
            
            // Update article stock using internal endpoint
            const updateResponse = await axios.patch(`http://localhost:3004/api/internal/articles/${item.articleId}/stock`, {
              stock: newStock,
            }, {
              timeout: 5000,
            });
            
            this.logger.log(`Successfully decremented stock for article ${item.articleId}: ${currentStock} -> ${updateResponse.data?.stock || newStock} (qty: ${item.qty})`);
          }
        } catch (e: any) {
          this.logger.error(`Failed to update stock for article ${item.articleId} in order ${id}:`, {
            error: e?.message,
            response: e?.response?.data,
            status: e?.response?.status,
            url: e?.config?.url,
          });
          // Continue with other items even if one fails - don't fail the entire confirmation
        }
      }
    }
    
    return this.findOne(id);
  }

  async getOrderStats() {
    try {
      let total = 0;
      let byStatus: any[] = [];
      let paidCount = 0;
      let unpaidCount = 0;
      let activeCount = 0;
      let inactiveCount = 0;

      try {
        total = await this.repo.count();
      } catch (e: any) {
        this.logger.warn('Error counting total orders:', e?.message);
      }

      try {
        byStatus = await this.repo
          .createQueryBuilder('order')
          .select('order.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('order.status')
          .getRawMany();
      } catch (e: any) {
        this.logger.warn('Error getting orders by status:', e?.message);
      }

      try {
        paidCount = await this.repo.count({ where: { isPaid: true } });
      } catch (e: any) {
        this.logger.warn('Error counting paid orders:', e?.message);
      }

      try {
        unpaidCount = await this.repo.count({ where: { isPaid: false } });
      } catch (e: any) {
        this.logger.warn('Error counting unpaid orders:', e?.message);
      }

      try {
        activeCount = await this.repo.count({ where: { isActive: true } });
      } catch (e: any) {
        this.logger.warn('Error counting active orders:', e?.message);
      }

      try {
        inactiveCount = await this.repo.count({ where: { isActive: false } });
      } catch (e: any) {
        this.logger.warn('Error counting inactive orders:', e?.message);
      }

      const byStatusMap: Record<string, number> = {};
      if (byStatus && Array.isArray(byStatus)) {
        byStatus.forEach((item: any) => {
          if (item?.status && item?.count) {
            byStatusMap[item.status] = parseInt(String(item.count), 10) || 0;
          }
        });
      }

      // Calculate total revenue (sum of all order totals)
      // total is stored as numeric in PostgreSQL
      let totalRevenue = 0;
      try {
        // Use query builder with proper handling for numeric type
        const revenueResult = await this.repo
          .createQueryBuilder('order')
          .select('COALESCE(SUM(order.total), 0)', 'total')
          .getRawOne();
        
        if (revenueResult?.total !== null && revenueResult?.total !== undefined) {
          // Handle both string and number types from PostgreSQL numeric
          const revenueValue = typeof revenueResult.total === 'string' 
            ? parseFloat(revenueResult.total) 
            : Number(revenueResult.total);
          totalRevenue = isNaN(revenueValue) ? 0 : revenueValue;
        }
      } catch (revenueError: any) {
        this.logger.error('Error calculating total revenue:', revenueError?.message || revenueError);
        // Fallback: calculate manually if SQL fails
        try {
          const allOrders = await this.repo.find({ select: ['total'] });
          totalRevenue = allOrders.reduce((sum, order) => {
            const orderTotal = parseFloat(String(order.total || '0'));
            return sum + (isNaN(orderTotal) ? 0 : orderTotal);
          }, 0);
        } catch (fallbackError: any) {
          this.logger.error('Fallback revenue calculation failed:', fallbackError?.message || fallbackError);
          totalRevenue = 0;
        }
      }

      return {
        total: total || 0,
        byStatus: byStatusMap,
        paid: paidCount || 0,
        unpaid: unpaidCount || 0,
        active: activeCount || 0,
        inactive: inactiveCount || 0,
        totalRevenue,
      };
    } catch (error) {
      this.logger.error('Error in getOrderStats:', error);
      // Return default stats instead of throwing to prevent 500 errors
      return {
        total: 0,
        byStatus: {},
        paid: 0,
        unpaid: 0,
        active: 0,
        inactive: 0,
        totalRevenue: 0,
      };
    }
  }
}
