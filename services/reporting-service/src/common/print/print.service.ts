import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import writeXlsxFile, { Row } from 'write-excel-file';
import { ApplicantRecords } from '../../modules/admission/entities/applicants.entity';
import { makeLabel } from '../../libs/utils/utils';

@Injectable()
export class PrintService {
    private getExcelType(value: any) {
        if (typeof value === 'string') {
            return String;
        } else if (typeof value === 'number') {
            return Number;
        } else if (typeof value === 'boolean') {
            return Boolean;
        } else if (dayjs(value as string).isValid()) {
            return Date;
        } else {
            return String;
        }
    }
    // reusable, make data accept student data too
    printToExcel(headers: string[], data: ApplicantRecords[]) {
        const HEADER_ROW: Row = headers.map((h) => ({
            value: makeLabel(h),
            fontWeight: 'bold',
        }));
        const DATA_ROWS = data.map((d) =>
            headers.map((h) => {
                const type = this.getExcelType(d[h]);
                return {
                    value: d[h] || '',
                    type: type,
                    format: type === Date ? 'DD-MM-YYYY' : undefined,
                };
            }),
        );
        const finalData = [HEADER_ROW, ...DATA_ROWS];
        return writeXlsxFile(finalData, {});
    }
}
