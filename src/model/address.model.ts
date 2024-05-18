export class AddressResponse {
  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postal_code: string;
}
export class CreateAddressRequest {
  contact_id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postal_code: string;
}

//karena Dalam Bab Get Address dibutuhkan dua parameter maka kita ringkas dalam satu model dengan cara
export class GetAddressRequest {
  ///jadi kalau butuh sesuatu kita dipanggil melalui query seperti dibawah ini
  contact_id: number;
  address_id: number;
}

export class UpdateAddressRequest {
  id: number;
  contact_id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postal_code: string;
}

//karena Dalam Bab Get Address dibutuhkan dua parameter maka kita ringkas dalam satu model dengan cara
export class RemoveAddressRequest {
  ///jadi kalau butuh sesuatu kita dipanggil melalui query seperti dibawah ini
  contact_id: number;
  address_id: number;
}
