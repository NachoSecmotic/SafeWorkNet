export class GeoPoint {
  type: string = 'Point';

  coordinates: number[] = [];

  constructor(longitude: number, latitude: number) {
    this.coordinates = [longitude, latitude];
  }
}
