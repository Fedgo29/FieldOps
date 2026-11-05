
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
