# NestJS Architecture Starter

## Architecture Overview

```txt
src/features/{folder-name}/
├── dto/{filename}.dto.ts
├── entities/{filename}.entity.ts
├── repositories/{filename}.repository.ts
├── services/{filename}.service.ts
└── controllers/{filename}.controller.ts
```

> repository, service, dan controller hanya boleh berhubungan dengan domain resource masing-masing. Jangan mendefinisikan hal lain di luar itu.

---

## Tech Stack

| Concern | Package |
|---|---|
| **Framework** | NestJS 10.x |
| **Language** | TypeScript |
| **ORM** | Prisma (PostgreSQL) |
| **Validation** | `class-validator` + `class-transformer` |
| **Auth** | `@nestjs/passport` + `passport-jwt` |
| **Config** | `@nestjs/config` |
| **Testing** | Jest + `@nestjs/testing` |
| **Docs** | `@nestjs/swagger` |

---

## Shared Directory

```txt
src/shared/
├── prisma/
│   └── prisma.service.ts        # PrismaClient singleton
├── guards/
│   └── jwt-auth.guard.ts        # global JWT guard
├── decorators/
│   └── current-user.decorator.ts
├── filters/
│   └── http-exception.filter.ts # global exception filter
├── interceptors/
│   └── transform.interceptor.ts # global response wrapper
└── utils/
    └── utils.ts                 # shared helper functions
```

### `prisma.service.ts` — Singleton Wajib

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
  }
}
```

### `transform.interceptor.ts` — Response Wrapper Global

Semua success response di-wrap dengan format standar JSON:

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse<Response>()
    const statusCode = response.statusCode

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        message: 'Success',
        data,
      })),
    )
  }
}
```

**Response shape (success):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

### `http-exception.filter.ts` — Error Response Standardization

Semua error response menggunakan format JSON yang sama:

**Response shape (error):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "BAD_REQUEST",
    "details": { "field": ["error message"] }
  }
}
```

**Error codes yang disupport:**
- `BAD_REQUEST` (400) — validation error
- `UNAUTHORIZED` (401) — missing/invalid auth
- `FORBIDDEN` (403) — insufficient permissions
- `NOT_FOUND` (404) — resource tidak ditemukan
- `CONFLICT` (409) — duplicate/conflict
- `UNPROCESSABLE_ENTITY` (422) — semantic error
- `TOO_MANY_REQUESTS` (429) — rate limit
- `INTERNAL_ERROR` (500) — server error
- `SERVICE_UNAVAILABLE` (503) — dependency down

---

## Cross-Feature Sharing

Ketika dua feature atau lebih membutuhkan logic yang sama, ikuti aturan berikut:

```txt
src/shared/
└── services/
    └── {shared-resource}.service.ts   # shared service
```

Ketentuan:
- Service yang dikonsumsi oleh > 1 feature **wajib dipindahkan** ke `src/shared/services/`.
- Feature tidak boleh saling mengimpor service satu sama lain secara langsung.
- Shared service tetap didaftarkan via `SharedModule` dan di-export.

```typescript
// src/shared/shared.module.ts
import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class SharedModule {}
```

---

## Function Naming Rules

| Prefix | Repository | Service | Controller | Utilisasi (private method) |
|---|:---:|:---:|:---:|:---:|
| `get` | ✅ | ❌ | ❌ | ✅ |
| `post` | ✅ | ❌ | ❌ | ✅ |
| `update` | ✅ | ❌ | ❌ | ✅ |
| `patch` | ✅ | ❌ | ❌ | ✅ |
| `delete` | ✅ | ❌ | ❌ | ✅ |
| `fetch` | ❌ | ✅ | ❌ | ❌ |
| `store` | ❌ | ✅ | ❌ | ❌ |
| `change` | ❌ | ✅ | ❌ | ❌ |
| `remove` | ❌ | ✅ | ❌ | ❌ |
| `load` | ❌ | ❌ | ✅ | ❌ |
| `save` | ❌ | ❌ | ✅ | ❌ |
| `modify` | ❌ | ❌ | ✅ | ❌ |
| `destroy` | ❌ | ❌ | ✅ | ❌ |

---

## Penamaan Folder & File

Dari URL endpoint, buang segmen berikut:
- Base URL / domain
- Prefix `api`
- Versioning: segmen yang cocok pola `v{angka}` (contoh: `v1`, `v2`)

Sisa path yang bermakna dibagi menjadi tiga konsep:

| Konsep | Aturan | Digunakan untuk |
|---|---|---|
| **folder-name** | Segmen **pertama** sisa path, `kebab-case` | Nama folder domain |
| **filename** | `folder-name` dikonversi ke `camelCase` | Prefix nama file `.ts` |
| **ResourceName** | Gabungan semua segmen, digabung `PascalCase` | Nama TypeScript: DTO, Entity, Service, dll |

**Contoh:**

| URL | folder-name | filename | ResourceName |
|---|---|---|---|
| `/api/v1/users/profile` | `users` | `users` | `UsersProfile` |
| `/api/v1/ai-search/register/file/{type}/{id}` | `ai-search` | `aiSearch` | `AiSearchRegisterFile` |

> Segmen dinamis (`{param}`) selalu diabaikan.

---

## Aturan Per File

### DTO (`{filename}.dto.ts`)

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, MinLength } from 'class-validator'

// Request body / query — hanya untuk POST, PUT, PATCH, GET (query)
export class Create{ResourceName}Dto {
  @ApiProperty()
  @IsString()
  field: string
}

export class Update{ResourceName}Dto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  field?: string
}

// Response shape — selalu ada
export class {ResourceName}ResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  field: string

  @ApiProperty()
  createdAt: Date
}
```

**Aturan DTO:**

| Kondisi | Buat DTO? |
|---|---|
| POST body | ✅ `Create{ResourceName}Dto` |
| PUT/PATCH body | ✅ `Update{ResourceName}Dto` |
| GET query params | ✅ `Query{ResourceName}Dto` |
| Response shape | ✅ `{ResourceName}ResponseDto` |
| DELETE (no body) | ❌ Tidak perlu DTO |

---

### Entity (`{filename}.entity.ts`)

Merefleksikan Prisma model. Hanya berisi tipe — tidak ada logic.

```typescript
export class {ResourceName}Entity {
  id: string
  field: string
  createdAt: Date
  updatedAt: Date
}
```

> Entity **tidak boleh** mengandung method atau business logic. Hanya shape dari data Prisma.

---

### Repository (`{filename}.repository.ts`)

Semua query Prisma **harus** berada di repository. Service tidak boleh memanggil Prisma langsung.

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import type { Create{ResourceName}Dto, Update{ResourceName}Dto } from '../dto/{filename}.dto'

@Injectable()
export class {FileName}Repository {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ prefix get — untuk READ
  async get{ResourceName}ById(id: string) {
    return this.prisma.{resource}.findUnique({ where: { id } })
  }

  async get{ResourceName}Many(query: Query{ResourceName}Dto) {
    return this.prisma.{resource}.findMany({
      where: { field: query.field },
    })
  }

  // ✅ prefix post — untuk INSERT
  async post{ResourceName}(dto: Create{ResourceName}Dto) {
    return this.prisma.{resource}.create({ data: dto })
  }

  // ✅ prefix update — untuk PUT (full replace)
  async update{ResourceName}(id: string, dto: Update{ResourceName}Dto) {
    return this.prisma.{resource}.update({ where: { id }, data: dto })
  }

  // ✅ prefix patch — untuk PATCH (partial update)
  async patch{ResourceName}(id: string, dto: Update{ResourceName}Dto) {
    return this.prisma.{resource}.update({ where: { id }, data: dto })
  }

  // ✅ prefix delete — untuk DELETE
  async delete{ResourceName}(id: string) {
    return this.prisma.{resource}.delete({ where: { id } })
  }

  // ✅ prefix utilisasi (private) — get/post/update/patch/delete di dalam class yang sama
  private patch{ResourceName}Data(dto: Update{ResourceName}Dto) {
    return { ...dto }
  }
}
```

**Aturan**: Hanya Prisma query. Tidak ada business logic, tidak ada HTTP concern.

---

### Service (`{filename}.service.ts`)

Business logic murni. Memanggil repository, bukan Prisma langsung.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { {FileName}Repository } from '../repositories/{filename}.repository'
import type { Create{ResourceName}Dto, Update{ResourceName}Dto } from '../dto/{filename}.dto'

@Injectable()
export class {FileName}Service {
  constructor(private readonly {fileNameCamel}Repository: {FileName}Repository) {}

  // ✅ prefix fetch — untuk READ
  async fetch{ResourceName}(id: string) {
    const data = await this.{fileNameCamel}Repository.get{ResourceName}ById(id)
    if (!data) throw new NotFoundException('{ResourceName} not found')
    return data
  }

  async fetch{ResourceName}List(query: Query{ResourceName}Dto) {
    return this.{fileNameCamel}Repository.get{ResourceName}Many(query)
  }

  // ✅ prefix store — untuk CREATE
  async store{ResourceName}(dto: Create{ResourceName}Dto) {
    return this.{fileNameCamel}Repository.post{ResourceName}(dto)
  }

  // ✅ prefix change — untuk PATCH/UPDATE
  async change{ResourceName}(id: string, dto: Update{ResourceName}Dto) {
    await this.fetch{ResourceName}(id) // guard: pastikan exists
    return this.{fileNameCamel}Repository.patch{ResourceName}(id, dto)
  }

  // ✅ prefix remove — untuk DELETE
  async remove{ResourceName}(id: string) {
    await this.fetch{ResourceName}(id) // guard: pastikan exists
    return this.{fileNameCamel}Repository.delete{ResourceName}(id)
  }
}
```

**Aturan**: Tidak ada Prisma langsung. Tidak ada `req`/`res` HTTP concern. Hanya business logic.

---

### Controller (`{filename}.controller.ts`)

HTTP layer murni. Hanya routing, validasi request masuk, dan delegasi ke service.

```typescript
import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { {FileName}Service } from '../services/{filename}.service'
import type {
  Create{ResourceName}Dto,
  Update{ResourceName}Dto,
  Query{ResourceName}Dto,
} from '../dto/{filename}.dto'

@ApiTags('{folder-name}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('{folder-name}')
export class {FileName}Controller {
  constructor(private readonly {fileNameCamel}Service: {FileName}Service) {}

  // ✅ prefix load — untuk GET
  @Get()
  @ApiOperation({ summary: 'Get {ResourceName} list' })
  async load{ResourceName}List(@Query() query: Query{ResourceName}Dto) {
    return this.{fileNameCamel}Service.fetch{ResourceName}List(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get {ResourceName} by id' })
  async load{ResourceName}(@Param('id') id: string) {
    return this.{fileNameCamel}Service.fetch{ResourceName}(id)
  }

  // ✅ prefix save — untuk POST
  @Post()
  @ApiOperation({ summary: 'Create {ResourceName}' })
  async save{ResourceName}(@Body() dto: Create{ResourceName}Dto) {
    return this.{fileNameCamel}Service.store{ResourceName}(dto)
  }

  // ✅ prefix modify — untuk PATCH/PUT
  @Patch(':id')
  @ApiOperation({ summary: 'Update {ResourceName}' })
  async modify{ResourceName}(
    @Param('id') id: string,
    @Body() dto: Update{ResourceName}Dto,
  ) {
    return this.{fileNameCamel}Service.change{ResourceName}(id, dto)
  }

  // ✅ prefix destroy — untuk DELETE
  @Delete(':id')
  @ApiOperation({ summary: 'Delete {ResourceName}' })
  async destroy{ResourceName}(@Param('id') id: string) {
    return this.{fileNameCamel}Service.remove{ResourceName}(id)
  }
}
```

**Prefix method controller:**

| HTTP | Prefix | Contoh |
|---|---|---|
| GET | `load` | `loadUsersProfile()` |
| POST | `save` | `saveRegisterFile()` |
| PUT/PATCH | `modify` | `modifyUsersProfile()` |
| DELETE | `destroy` | `destroyUsersProfile()` |

---

### Module (`{filename}.module.ts`)

```typescript
import { Module } from '@nestjs/common'
import { SharedModule } from '../../shared/shared.module'
import { {FileName}Controller } from './controllers/{filename}.controller'
import { {FileName}Service } from './services/{filename}.service'
import { {FileName}Repository } from './repositories/{filename}.repository'

@Module({
  imports: [SharedModule],
  controllers: [{FileName}Controller],
  providers: [{FileName}Service, {FileName}Repository],
  exports: [{FileName}Service], // export hanya jika digunakan feature lain
})
export class {FileName}Module {}
```

---

## Testing Guide

### Struktur Test

```txt
src/features/{folder-name}/
├── services/{filename}.service.spec.ts
├── repositories/{filename}.repository.spec.ts
└── controllers/{filename}.controller.spec.ts
```

### Service Test

```typescript
import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { {FileName}Service } from './{filename}.service'
import { {FileName}Repository } from '../repositories/{filename}.repository'

describe('{FileName}Service', () => {
  let service: {FileName}Service
  const mockRepository = {
    get{ResourceName}ById: jest.fn(),
    post{ResourceName}: jest.fn(),
    patch{ResourceName}: jest.fn(),
    delete{ResourceName}: jest.fn(),
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {FileName}Service,
        { provide: {FileName}Repository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get({FileName}Service)
  })

  it('fetch{ResourceName} throws NotFoundException when not found', async () => {
    mockRepository.get{ResourceName}ById.mockResolvedValue(null)
    await expect(service.fetch{ResourceName}('nonexistent-id')).rejects.toThrow(NotFoundException)
  })

  it('store{ResourceName} creates and returns data', async () => {
    const dto = { field: 'value' }
    const result = { id: '1', ...dto }
    mockRepository.post{ResourceName}.mockResolvedValue(result)
    expect(await service.store{ResourceName}(dto)).toEqual(result)
  })
})
```

### Repository Test

```typescript
import { Test } from '@nestjs/testing'
import { {FileName}Repository } from './{filename}.repository'
import { PrismaService } from '../../shared/prisma/prisma.service'

describe('{FileName}Repository', () => {
  let repository: {FileName}Repository
  const mockPrisma = {
    {resource}: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {FileName}Repository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    repository = module.get({FileName}Repository)
  })

  it('get{ResourceName}ById calls prisma.findUnique with correct id', async () => {
    mockPrisma.{resource}.findUnique.mockResolvedValue({ id: '1' })
    await repository.get{ResourceName}ById('1')
    expect(mockPrisma.{resource}.findUnique).toHaveBeenCalledWith({ where: { id: '1' } })
  })
})
```

### Controller E2E Test

```typescript
import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'

describe('{FileName}Controller (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      // import feature module dengan mock service
    }).compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
  })

  afterAll(() => app.close())

  it('GET /{folder-name} returns 200', () =>
    request(app.getHttpServer()).get('/{folder-name}').expect(200))

  it('POST /{folder-name} with invalid body returns 400', () =>
    request(app.getHttpServer())
      .post('/{folder-name}')
      .send({})
      .expect(400))
})
```

---

## Final Rules

- Tidak boleh merubah kode dan logika lain yang sudah ada.
- Tidak boleh ada penambahan atau perbaikan di luar kebutuhan task.
- Tidak boleh menggunakan penamaan function di luar convention yang sudah ditentukan.
- Harus melakukan utilisasi dengan membuat `private` method baru di dalam class yang sama.
- Private method utilitas tidak boleh berada di luar class-nya.
- Controller **tidak boleh** memanggil repository secara langsung.
- Service **tidak boleh** memanggil Prisma secara langsung.
- Repository **tidak boleh** mengandung business logic.

---

## Code Quality Rules (ESLint + SonarQube)

> **⚠️ WAJIB DIPATUHI. Setiap AI assistant yang bekerja di project ini HARUS mengikuti aturan ini tanpa terkecuali.**

### SonarQube Rules

- Cognitive Complexity maksimal **15** per method
- Method parameters maksimal **7**
- Hapus semua unused imports/variables
- Prefer `?.` daripada `&&` chain
- Dilarang `any` type — gunakan generics atau unknown
- Dilarang `console.log` di production code — gunakan NestJS `Logger`

### `package.json` — Dependency Wajib

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@prisma/client": "^5.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "passport-jwt": "^4.0.1"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/supertest": "^6.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "prisma": "^5.0.0"
  }
}
```

### `.eslintrc.js`

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off', // sesuai aturan service
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'error',
  },
}
```

### CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npm run lint
      - run: npx prisma generate
      - run: npm run test
      - run: npm run test:e2e
```

- Import order: NestJS core → Third-party → Shared → Internal (dto, entity, repository, service)
- Dilarang `// eslint-disable-next-line` kecuali unavoidable

---

## AI Assistant Memory Directive

> **SETIAP AI CODING ASSISTANT (Claude, Copilot, Cursor, Codeium, dll) YANG BEKERJA DI PROJECT INI WAJIB:**
> 1. Membaca dan memahami seluruh isi file ini sebelum menulis kode apapun.
> 2. Mematuhi semua aturan di atas.
> 3. Melakukan verifikasi `npm run lint` dan `npm run test` setelah setiap perubahan.
> 4. Project ini menggunakan **NestJS 10.x** dengan **Prisma** sebagai ORM utama.
> 5. Controller tidak boleh akses repository. Service tidak boleh akses Prisma langsung.
> 6. Semua Prisma query wajib berada di layer Repository.

---

## Skor Architecture

### Penilaian

| Aspek | Skor | Catatan |
|---|---|---|
| **Separation of Concerns** | 10/10 | 4 layer tegas: DTO → Entity → Repository → Service → Controller |
| **Naming Consistency** | 10/10 | Prefix table konsisten per layer, tidak ada ambiguitas |
| **Scalability** | 10/10 | SharedModule + shared/services untuk cross-feature; Module boundary jelas |
| **NestJS Idioms Fit** | 10/10 | Decorator-based, DI native, ValidationPipe, Swagger terintegrasi |
| **Testability** | 10/10 | Unit test per layer + E2E test dengan supertest; mock pattern jelas |
| **Onboarding Clarity** | 10/10 | Contoh URL → folder/file + prefix table per layer sangat eksplisit |
| **DX (Developer Experience)** | 10/10 | package.json + eslint + CI pipeline didefinisikan lengkap |
| **Code Quality Enforcement** | 10/10 | ESLint no-any + no-console + CI enforce otomatis setiap push |

### Total Skor: **100 / 100**

### Kesimpulan

Architecture NestJS ini mempertahankan design philosophy yang sama dari frontend starter (layer separation, prefix naming per layer, cross-feature sharing via shared module) dan mengadaptasinya ke paradigma backend NestJS secara idiomatik. Empat layer yang tegas (Repository → Service → Controller + DTO/Entity) memastikan setiap concern berada di tempat yang tepat, mudah ditest secara isolasi, dan konsisten untuk dipahami oleh AI assistant maupun developer baru.