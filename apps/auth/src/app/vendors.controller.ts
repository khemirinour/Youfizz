import { BadRequestException, Body, Controller, ForbiddenException, NotFoundException, Post, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendeur } from '../entities/vendeur.entity';

@Controller('internal/vendors')
export class VendorsController {
  constructor(
    @InjectRepository(Vendeur) private readonly vendeurRepo: Repository<Vendeur>,
  ) {}

  @Get('confirm-quota')
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


