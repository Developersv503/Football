import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common'
import { ZodSchema } from 'zod'

/**
 * Valida body/query contra un esquema Zod. Uso: `new ZodValidationPipe(schema)`.
 *
 * Se aplica a nivel de método (`@UsePipes`), lo que en Nest corre el pipe
 * sobre TODOS los parámetros del handler — no solo el que lleva el schema.
 * En handlers con `@Param()` o `@CurrentUser()` además de `@Query()/@Body()`,
 * eso intentaría validar un string/id contra un schema de objeto y siempre
 * fallaría. Por eso solo se valida cuando el parámetro es realmente query o body.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query' && metadata.type !== 'body') return value

    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException({
        message: 'Error de validación',
        errors: result.error.flatten().fieldErrors,
      })
    }
    return result.data
  }
}
