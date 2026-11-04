import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Client error: ${error.error.message}`;
      } else if (typeof error.error === 'string' && error.error.trim().length > 0) {
        // Plain text message returned by backend (e.g. from GlobalExceptionHandler or Controller)
        errorMessage = error.error;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the backend server. Please verify the backend is running at http://localhost:8585.';
      } else if (error.status === 400) {
        errorMessage = typeof error.error === 'string' ? error.error : 'Bad Request: Please check the submitted data.';
      } else if (error.status === 404) {
        errorMessage = typeof error.error === 'string' ? error.error : 'Requested resource was not found.';
      } else if (error.status === 409) {
        errorMessage = 'Conflict: Record already exists or is in an incompatible state.';
      } else if (error.status === 500) {
        errorMessage = typeof error.error === 'string' ? error.error : 'Server encountered an internal error.';
      }

      // Display toast notification
      notificationService.error(errorMessage);

      return throwError(() => new Error(errorMessage));
    })
  );
};
