/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "user";

export interface TokenRequest {
  token: string;
}

export interface TokenResponse {
  isValid: boolean;
  userId: string;
}

export const USER_PACKAGE_NAME = "user";

export interface UserServiceClient {
  validate(request: TokenRequest): Observable<TokenResponse>;
}

export interface UserServiceController {
  validate(request: TokenRequest): Promise<TokenResponse> | Observable<TokenResponse> | TokenResponse;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["validate"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_SERVICE_NAME = "UserService";
