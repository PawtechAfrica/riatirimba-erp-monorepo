import { Module } from '@nestjs/common';
import { AdmissionController } from './admission.controller';
import { AdmissionService } from './admission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantRecords } from './entities/applicants.entity';
import { AdmissionMsgController } from './admission.msg.controller';
import { ExtServicesModule } from '../../common/extServices/extServices.module';

@Module({
    exports: [AdmissionService],
    imports: [TypeOrmModule.forFeature([ApplicantRecords]), ExtServicesModule],
    controllers: [AdmissionController, AdmissionMsgController],
    providers: [AdmissionService],
})
export class AdmissionModule {}
