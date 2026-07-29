import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { FastifyReply } from 'fastify'

/** Normaliza cualquier error (Nest o no) a { statusCode, message } — nunca filtra el stack al cliente. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      reply.status(status).send(exception.getResponse())
      return
    }

    console.error(exception)
    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
    })
  }
}
