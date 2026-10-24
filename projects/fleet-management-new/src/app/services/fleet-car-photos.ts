/**
 * A vehicle's paint colour is a property of its *photo*, not of its row.
 *
 * Every vehicle pins one folder of `fleet-management-new/car_images.json`
 * through `FleetVehicle.photoKey`, and the colour the UI shows is read from
 * this map rather than authored per vehicle. That makes "the swatch disagrees
 * with the car in the picture" impossible to express: there is one colour per
 * folder, and the photo and the colour are always read from the same key.
 *
 * Folders that state their colour are self-documenting; for the rest the colour
 * is read off the photo and recorded below. When a folder is added to the
 * catalog, add its colour here too.
 */
export interface FleetPaintColor {
  /** Shown in the spec grid and used in the photo's alt text. */
  name: string;
  /** Approximate paint colour, for the swatch beside the name. */
  hex: string;
}

/** Keyed by folder name in `fleet-management-new/car_images.json`. */
export const FLEET_PHOTO_COLORS: Readonly<Record<string, FleetPaintColor>> = {
  // These folders state their colour, so the photo and the name cannot drift.
  'Ford F-150 blue': { name: 'Blue', hex: '#1e5aa8' },
  'Ford F-150 red': { name: 'Red', hex: '#b32024' },
  'Ford Focus blue': { name: 'Blue', hex: '#1e5aa8' },
  'Ford Focus dark gray': { name: 'Dark Gray', hex: '#4a5058' },
  'Ford Mustang blue': { name: 'Blue', hex: '#1e5aa8' },
  'Ford Mustang red': { name: 'Red', hex: '#b32024' },
  'Kia Ceed red': { name: 'Red', hex: '#b32024' },
  'Kia Ceed white': { name: 'White', hex: '#eceef0' },
  'Kia EV6 gray': { name: 'Gray', hex: '#7d858e' },
  'Kia EV6 red': { name: 'Red', hex: '#b32024' },
  'Tesla 3 red': { name: 'Red', hex: '#b32024' },
  'Tesla 3 white 1': { name: 'White', hex: '#eceef0' },
  'Tesla 3 white 2': { name: 'White', hex: '#eceef0' },
  'Tesla 3 white 3': { name: 'White', hex: '#eceef0' },
  'VW Passat black': { name: 'Black', hex: '#1c1f24' },
  'VW Passat gray': { name: 'Gray', hex: '#7d858e' },

  // These folders say nothing about the colour, so it was read off the photo.
  // Every entry below was checked against the picture the folder actually holds.
  'Honda Civic': { name: 'Midnight Blue', hex: '#26334d' },
  'Hyundai ix35': { name: 'Silver', hex: '#c3c8cd' },
  'Hyundai Kona': { name: 'Black', hex: '#1c1f24' },
  'Kia Soul': { name: 'Copper', hex: '#9c5f36' },
  'Kia Sportage': { name: 'White', hex: '#eceef0' },
  'Mazda 3': { name: 'Black', hex: '#1c1f24' },
  'Mazda 6': { name: 'Black', hex: '#1c1f24' },
  'Toyota Corolla': { name: 'Red', hex: '#b32024' },
  'Toyota RAV4 1': { name: 'Graphite', hex: '#3f4550' },
  'Toyota RAV4 2': { name: 'Silver', hex: '#c3c8cd' },
  'Toyota Tundra': { name: 'Black', hex: '#1c1f24' },
  'VW Caddy 1': { name: 'White', hex: '#eceef0' },
  'VW Caddy 2': { name: 'Dark Gray', hex: '#4a5058' },
  'VW Golf': { name: 'Bronze', hex: '#a87840' },
  'VW Polo': { name: 'Gray', hex: '#6b7078' },
  'VW Touareg 1': { name: 'White', hex: '#eceef0' },
  'VW Touareg 2': { name: 'White', hex: '#eceef0' },

  // Same, checked the same way. No vehicle points at these two yet, so pinning
  // one to a vehicle needs no further verification.
  'Mazda MX-5': { name: 'Silver', hex: '#c3c8cd' },
  'Toyota RAV4 3': { name: 'Blue', hex: '#1e78c8' }
};

const UNKNOWN_PAINT_COLOR: FleetPaintColor = { name: 'Unlisted', hex: '#8a9099' };

export function fleetPaintColor(photoKey: string): FleetPaintColor {
  return FLEET_PHOTO_COLORS[photoKey] ?? UNKNOWN_PAINT_COLOR;
}
