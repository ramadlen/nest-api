import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}
  async use(req: any, res: any, next: (error?: any) => void) {
    //cek apakah ada token?
    const token = req.headers[`authorization`] as string;
    if (token) {
      const user = await this.prismaService.user.findFirst({
        where: {
          token: token,
        },
      });
      if (user) {
        //kita akan simpan data
        req.user = user;
      }
    }
    next();
  }
}
