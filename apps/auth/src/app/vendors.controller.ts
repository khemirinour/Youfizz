import { BadRequestException, Body, Controller, ForbiddenException, NotFoundException, Post, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendeur } from '../entities/vendeur.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('internal')
@Controller('internal/vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(
    @InjectRepository(Vendeur) private readonly vendeurRepo: Repository<Vendeur>,
  ) {}

  @Get('confirm-quota')
  @ApiOperation({ summary: 'Get vendor confirmation quota' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Vendor ID' })
  @ApiQuery({ name: 'vendorUserId', required: false, description: 'Vendor User ID' })
  @ApiResponse({ status: 200, description: 'Vendor quota retrieved', schema: { 
    type: 'object', 
    properties: { 
      vendorId: { type: 'string' }, 
      remaining: { type: 'number' } 
    } 
  }})
  @ApiResponse({ status: 400, description: 'Bad request - vendorId or vendorUserId required' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getConfirmQuota(@Query() query: { vendorId?: string; vendorUserId?: string }) {
    if (!query?.vendorId && !query?.vendorUserId) {
      throw new BadRequestException('vendorId or vendorUserId is required');
    }
    let vendeur: Vendeur | null = null;
    if (query.vendorId) {
      vendeur = await this.vendeurRepo.findOne({ where: { id: query.vendorId } });
    }
    if (!vendeur && query.vendorUserId) {
      vendeur = await this.vendeurRepo.findOne({ where: { idUser: query.vendorUserId } });
    }
    if (!vendeur) throw new NotFoundException('Vendor not found');
    return { vendorId: vendeur.id, remaining: vendeur.nbrCmdConf };
  }

  @Post('confirm-quota/consume')
  @ApiOperation({ summary: 'Consume vendor confirmation quota' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        vendorId: { type: 'string' }, 
        vendorUserId: { type: 'string' } 
      },
      description: 'Either vendorId or vendorUserId is required'
    } 
  })
  @ApiResponse({ status: 200, description: 'Quota consumed successfully', schema: { 
    type: 'object', 
    properties: { 
      vendorId: { type: 'string' }, 
      remaining: { type: 'number' } 
    } 
  }})
  @ApiResponse({ status: 400, description: 'Bad request - vendorId or vendorUserId required' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @ApiResponse({ status: 403, description: 'No remaining confirmations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async consumeConfirmQuota(@Body() body: { vendorId?: string; vendorUserId?: string }) {
    if (!body?.vendorId && !body?.vendorUserId) {
      throw new BadRequestException('vendorId or vendorUserId is required');
    }
    let vendeur: Vendeur | null = null;
    if (body.vendorId) {
      vendeur = await this.vendeurRepo.findOne({ where: { id: body.vendorId } });
    }
    if (!vendeur && body.vendorUserId) {
      vendeur = await this.vendeurRepo.findOne({ where: { idUser: body.vendorUserId } });
    }
    if (!vendeur) throw new NotFoundException('Vendor not found');
    if ((vendeur.nbrCmdConf ?? 0) <= 0) {
      throw new ForbiddenException('Vendor has no remaining confirmations');
    }
    await this.vendeurRepo.update({ id: vendeur.id }, { nbrCmdConf: vendeur.nbrCmdConf - 1 });
    return { vendorId: vendeur.id, remaining: vendeur.nbrCmdConf - 1 };
  }
}


