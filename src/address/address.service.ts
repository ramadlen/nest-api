import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Address, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from 'src/model/address.model';
import { Logger } from 'winston';
import { AddressValidation } from './address.validation';
import { ContactService } from 'src/contact/contact.service';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
  ) {}

  async create(
    user: User,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    //menambahkan logging
    this.logger.debug(
      `AddressService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    //kita cek dulu
    const createRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );
    //kita cek kontak di db dan dipastikan ada
    await this.contactService.checkContactMustExists(
      user.username,
      createRequest.contact_id,
    );

    //ini insert data
    const address = await this.prismaService.address.create({
      data: createRequest,
    });
    return this.toAdddressResponse(address);
  }

  //supaya lebih reusable kodenya(tidak makan ruang) maka
  toAdddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postal_code: address.postal_code,
    };
  }

  //kodenya dibuat reusable (ringkasan(tinggal panggil aja))
  async checkAddressMustExists(
    contactId: number,
    addressId: number,
  ): Promise<Address> {
    const address = await this.prismaService.address.findFirst({
      where: {
        id: addressId,
        contact_id: contactId,
      },
    });
    //kita cek bareng ya sayang
    if (!address) {
      throw new HttpException('Addressis not Found', 404);
    }
    return address;
  }
  async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
    //kita validasi dulu
    const getRequest: GetAddressRequest = this.validationService.validate(
      AddressValidation.GET,
      request,
    );
    //selanjutnya, kita cek apakah benar ada
    await this.contactService.checkContactMustExists(
      user.username,
      getRequest.contact_id,
    );

    const address = await this.checkAddressMustExists(
      getRequest.contact_id,
      getRequest.address_id,
    );
    return this.toAdddressResponse(address);
  }

  async update(
    user: User,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    const updateRequest: UpdateAddressRequest = this.validationService.validate(
      AddressValidation.UPDATE,
      request,
    );
    //selanjutnya, kita cek apakah benar ada
    await this.contactService.checkContactMustExists(
      user.username,
      updateRequest.contact_id,
    );

    let address = await this.checkAddressMustExists(
      updateRequest.contact_id,
      updateRequest.id,
    );

    //kita update ke db melalui prisma
    address = await this.prismaService.address.update({
      where: {
        id: address.id,
        contact_id: address.contact_id,
      },
      //data yang mau diupdate adalah update request
      data: updateRequest,
    });
    return this.toAdddressResponse(address);
  }

  async remove(
    user: User,
    request: RemoveAddressRequest,
  ): Promise<AddressResponse> {
    const removeRequest: RemoveAddressRequest = this.validationService.validate(
      AddressValidation.REMOVE,
      request,
    );
    //kita cek
    await this.contactService.checkContactMustExists(
      user.username,
      removeRequest.contact_id,
    );
    await this.checkAddressMustExists(
      removeRequest.contact_id,
      removeRequest.address_id,
    );
    //setelah kita cek dan ada baru kita hapus
    const address = await this.prismaService.address.delete({
      where: {
        id: removeRequest.address_id,
        contact_id: removeRequest.contact_id,
      },
    });
    return this.toAdddressResponse(address);
  }

  //ini logic untuk list
  async list(user: User, contactId: number): Promise<AddressResponse[]> {
    //kita cek konntaknya harus ada
    await this.contactService.checkContactMustExists(user.username, contactId);
    const addresses = await this.prismaService.address.findMany({
      where: {
        contact_id: contactId,
      },
    });
    //kita returnkan dan kita transform lalu kita convert menjadi seperti berikut
    return addresses.map((address) => this.toAdddressResponse(address));
  }
}
