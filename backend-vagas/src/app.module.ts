import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AreaModule } from './area/area.module';
import { AuthModule } from './auth/auth.module';
import { CandidaturaModule } from './candidatura/candidatura.module';
import { HabilidadeModule } from './habilidade/habilidade.module';
import { NivelModule } from './nivel/nivel.module';
import { PrismaModule } from './prisma/prisma.module';
import { RequisitoModule } from './requisito/requisito.module';
import { StatusModule } from './status/status.module';
import { VagaModule } from './vaga/vaga.module';

@Module({
  imports: [
    // As variáveis (DATABASE_URL, JWT_SECRET...) chegam em process.env:
    // injetadas pelo Infisical ou, localmente, lidas do arquivo .env
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    VagaModule,
    CandidaturaModule,
    AreaModule,
    NivelModule,
    StatusModule,
    RequisitoModule,
    HabilidadeModule,
  ],
})
export class AppModule {}
