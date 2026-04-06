export * from './provider.service';
import { ProviderService } from './provider.service';
export * from './providerHospital.service';
import { ProviderHospitalService } from './providerHospital.service';
export * from './providerPublic.service';
import { ProviderPublicService } from './providerPublic.service';
export const APIS = [ProviderService, ProviderHospitalService, ProviderPublicService];
