import { Global, Module } from '@nestjs/common';
import { AdmissionModule } from '../../modules/admission/admission.module';
import { SyncService } from './sync.service';

@Global()
@Module({
    imports: [AdmissionModule],
    exports: [SyncService],
    providers: [SyncService],
})
export class SyncModule {}
