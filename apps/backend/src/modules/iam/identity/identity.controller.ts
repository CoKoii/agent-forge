import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { IdentityService } from "./identity.service";
import { CreateIdentityDto } from "./dto/create-identity.dto";
import { UpdateIdentityDto } from "./dto/update-identity.dto";

@Controller("identity")
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post()
  create(@Body() createIdentityDto: CreateIdentityDto) {
    return this.identityService.create(createIdentityDto);
  }

  @Get()
  findAll() {
    return this.identityService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.identityService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateIdentityDto: UpdateIdentityDto) {
    return this.identityService.update(+id, updateIdentityDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.identityService.remove(+id);
  }
}
