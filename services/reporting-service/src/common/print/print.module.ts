import { Global, Module } from '@nestjs/common';
import { PrintService } from './print.service';

@Global()
@Module({
    imports: [],
    providers: [PrintService],
    exports: [PrintService],
})
export class PrintModule {}
