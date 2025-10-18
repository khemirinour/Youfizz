import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage?: Record<string, string>;
}

@Injectable()
export class TracingService {
  private readonly logger = new Logger(TracingService.name);
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('TRACING_ENABLED') || false;
  }

  generateTraceId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  generateSpanId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  createTraceContext(parentContext?: TraceContext): TraceContext {
    return {
      traceId: parentContext?.traceId || this.generateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId: parentContext?.spanId,
      baggage: parentContext?.baggage || {},
    };
  }

  extractTraceContext(headers: Record<string, string>): TraceContext | null {
    if (!this.enabled) return null;

    const traceId = headers['x-trace-id'] || headers['x-request-id'];
    const spanId = headers['x-span-id'];
    const parentSpanId = headers['x-parent-span-id'];

    if (!traceId) return null;

    return {
      traceId,
      spanId: spanId || this.generateSpanId(),
      parentSpanId,
      baggage: this.parseBaggage(headers['x-baggage']),
    };
  }

  injectTraceContext(context: TraceContext): Record<string, string> {
    if (!this.enabled) return {};

    const headers: Record<string, string> = {
      'x-trace-id': context.traceId,
      'x-span-id': context.spanId,
    };

    if (context.parentSpanId) {
      headers['x-parent-span-id'] = context.parentSpanId;
    }

    if (context.baggage && Object.keys(context.baggage).length > 0) {
      headers['x-baggage'] = this.serializeBaggage(context.baggage);
    }

    return headers;
  }

  private parseBaggage(baggageHeader?: string): Record<string, string> {
    if (!baggageHeader) return {};

    const baggage: Record<string, string> = {};
    const pairs = baggageHeader.split(',');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        baggage[key.trim()] = decodeURIComponent(value.trim());
      }
    }

    return baggage;
  }

  private serializeBaggage(baggage: Record<string, string>): string {
    return Object.entries(baggage)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join(',');
  }

  logSpan(operation: string, context: TraceContext, duration?: number, metadata?: any): void {
    if (!this.enabled) return;

    this.logger.debug({
      type: 'span',
      operation,
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      duration,
      metadata,
    }, `Span: ${operation}`);
  }

  logTrace(event: string, context: TraceContext, metadata?: any): void {
    if (!this.enabled) return;

    this.logger.debug({
      type: 'trace',
      event,
      traceId: context.traceId,
      spanId: context.spanId,
      metadata,
    }, `Trace: ${event}`);
  }
}
