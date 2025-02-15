import { Test } from '@nestjs/testing';
import { ACLModule } from '@/common/access-control/acl.module';
import { ACGuard } from 'nest-access-control';
import { AclFilterResponseInterceptor } from '@/common/access-control/interceptors/acl-filter-response.interceptor';
import { AclValidateRequestInterceptor } from '@/common/access-control/interceptors/acl-validate-request.interceptor';
import { CallHandler, ExecutionContext, INestApplication, Provider, Type } from '@nestjs/common';
import console from 'console';
import { AppLoggerModule } from '@/common/app-logger/app-logger.module';
import { ClsModule } from 'nestjs-cls';
import { AuthKeyMiddleware } from '@/common/middlewares/auth-key.middleware';
import { CustomerModule } from '@/customer/customer.module';
import { CustomerService } from '@/customer/customer.service';

export const commonTestingModules = [
  ClsModule.forRoot({
    global: true,
  }),
  AppLoggerModule,
  CustomerModule,
];

const acGuard = {
  canActivate: () => {
    return true;
  },
};

const aclValidateRequestInterceptor = {
  intercept: (_context: ExecutionContext, next: CallHandler) => {
    return next.handle();
  },
};

const aclFilterResponseInterceptor = {
  intercept: (_context: ExecutionContext, next: CallHandler) => {
    return next.handle();
  },
};

export const fetchServiceFromModule = async <T>(
  service: Type<T>,
  dependencies: Provider[] = [],
  modules: Type<any>[] = [],
) => {
  const moduleRef = await Test.createTestingModule({
    providers: [service, ...dependencies],
    imports: [...modules, ...commonTestingModules],
  }).compile();

  return moduleRef.get<typeof service>(service);
};

export const initiateNestApp = async (
  app: INestApplication,
  providers: Provider[] = [],
  controllers: Array<Type>,
  modules: Array<Type>,
) => {
  const moduleRef = await Test.createTestingModule({
    providers: providers,
    controllers: controllers,
    imports: [ACLModule, ...modules, ...commonTestingModules],
  })
    .overrideGuard(ACGuard)
    .useValue(acGuard)
    .overrideInterceptor(AclFilterResponseInterceptor)
    .useValue(aclFilterResponseInterceptor)
    .overrideInterceptor(AclValidateRequestInterceptor)
    .useValue(aclValidateRequestInterceptor)
    .compile();

  app = moduleRef.createNestApplication();
  const middlewareInstnace = new AuthKeyMiddleware(app.get(CustomerService));

  app.use(middlewareInstnace.use.bind(middlewareInstnace));
  await app.init();

  return app;
};
