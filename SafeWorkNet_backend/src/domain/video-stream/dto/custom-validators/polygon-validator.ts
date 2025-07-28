import {
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPolygon', async: false })
export class IsPolygonConstraint implements ValidatorConstraintInterface {
  validate(polygon: any[]): boolean {
    if (!Array.isArray(polygon)) {
      return false;
    }

    for (const point of polygon) {
      if (!Array.isArray(point) || point.length !== 2) {
        return false;
      }
      if (point.some((coord) => typeof coord !== 'number')) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(): string {
    return 'Polygon must be an array of arrays, where each inner array contains exactly two numbers.';
  }
}

export function IsPolygon(validationOptions?: any) {
  return function (object: any, propertyName: string) {
    Validate(IsPolygonConstraint, validationOptions)(object, propertyName);
  };
}
