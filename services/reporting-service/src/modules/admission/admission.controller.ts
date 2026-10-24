import { Body, Controller, Get, Param, Post, StreamableFile } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { GenApplicantsDto } from './dto/gen-applicants.dto';

@Controller('admission')
export class AdmissionController {
    constructor(private readonly admissionService: AdmissionService) {}

    @Get('applicants')
    applicantRecords() {
        return this.admissionService.allRecords();
    }
    @Post('report/:applicants')
    async printReport(
        @Param() applicants: boolean,
        @Body() body: GenApplicantsDto,
    ) {
        // TODO: add student service as the other alternative
        const service = applicants
            ? this.admissionService
            : this.admissionService;
        const blob = await service.generateExcel(body);
    }
}
