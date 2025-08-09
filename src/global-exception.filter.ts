import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }
    // Handle Mongoose errors
    else if (exception instanceof MongooseError) {
      status = HttpStatus.BAD_REQUEST;
      message = `MongoDB error: ${exception.message}`;
    }
    // Handle MongoDB errors
    else if (exception instanceof MongoError) {
      status = HttpStatus.BAD_REQUEST;
      message = `MongoDB error: ${exception.message}`;
      if (exception.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate key error: resource already exists';
      }
    }
    // Handle generic errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error for debugging
    console.error('Error occurred:', exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
