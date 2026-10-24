import {Module} from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import {AdmissionExtService} from './admissionExt.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            useFactory: () => ({
                baseURL: process.env.NODE_ENV === 'development'
                    ? "http://localhost:5000/api/v1"
                    : "http://admission-service:5000/api/v1",
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }),
        }),
    ],
    providers: [AdmissionExtService],
    exports: [AdmissionExtService],
})
export class ExtServicesModule {
}
