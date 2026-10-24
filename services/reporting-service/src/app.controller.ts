import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    StreamableFile,
} from '@nestjs/common';


import type { Response } from 'express';
import { AppService } from './app.service';
import { GenApplicantsDto } from './modules/admission/dto/gen-applicants.dto';
import { AdmissionService } from './modules/admission/admission.service';
import { Readable } from 'node:stream';
import dayjs from 'dayjs';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly admissionService: AdmissionService,
    ) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
    @Post('report/:applicants')
    async exportReport(
        @Body() body: GenApplicantsDto,
        @Param() applicants: boolean,
        @Res({ passthrough: true }) res: Response,
    ) {
        // decide whether to use applicant service or student service
        let blob: Blob | undefined;
        console.log("XX: ")
        if (applicants) blob = await this.admissionService.generateExcel(body);
        if (blob) {
            const stream = Readable.from(blob.stream());
            const filename = `${body.name || `report-${dayjs().format('hh:mm:ss DD-MMM-YYYY')}`}.xlsx`;
            res.set({
                'Content-Type': blob.type || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'X-Content-Type-Options': 'nosniff',
            });
            return new StreamableFile(stream);
        }
        console.log('Generating report...');
        res.status(500).json({
            error: 'Error generating report',
        });
    }
}
