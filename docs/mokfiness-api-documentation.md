# Mokfitness API Documentation

**接口概览**

- 认证与用户
- 首页与汇总统计
- 运动记录与明细
- 资源内容

**公共约定**
- Base URL: `http://data.mokfitness.cn`
- 公共前缀: `/mokfitness/new/api`
- 认证方式: `Authorization: Bearer <token>`
- 常见请求头:
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `authorization: Bearer <token 或空字符串>`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- 返回格式大多为 JSON
- `code` 字段在不同接口中可能是 `string` 或 `number`，调用侧建议兼容两种类型
- 本批样本中未出现 Path 参数，均为 Query 或 Body 参数

---

## 一、认证与用户

### 1. 发送验证码
**接口基本信息**
- 接口名称: 发送手机验证码
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/sendVerifyCode`
- 请求方法: `GET`
- 接口描述: 向指定手机号发送短信验证码

**请求参数（Request）**
- Headers
  - `authorization: Bearer `，样本中为空，推测此接口可匿名调用
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名 | 类型   |          示例 | 说明   |
| ------ | ------ | ------------: | ------ |
| phone  | string | `17777777777` | 手机号 |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": "200"
}
```

| 字段名 | 类型   | 含义                           | 示例值  |
| ------ | ------ | ------------------------------ | ------- |
| code   | string | 请求处理结果码，`200` 表示成功 | `"200"` |

---

### 2. 获取飞鸽验证码
**接口基本信息**
- 接口名称: 获取验证码明文
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainFeigeCode`
- 请求方法: `GET`
- 接口描述: 根据手机号获取验证码明文，疑似调试或二次验证接口

**请求参数（Request）**
- Headers
  - `authorization: Bearer `
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名 | 类型   |          示例 | 说明   |
| ------ | ------ | ------------: | ------ |
| phone  | string | `17777777777` | 手机号 |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": "200",
  "data": {
    "code": "559943"
  }
}
```

| 字段名    | 类型   | 含义               | 示例值                 |
| --------- | ------ | ------------------ | ---------------------- |
| code      | string | 请求状态码         | `"200"`                |
| data      | object | 业务数据           | `{ "code": "559943" }` |
| data.code | string | 发送到用户的验证码 | `"559943"`             |

---

### 3. 手机号查询用户是否存在并返回登录态
**接口基本信息**
- 接口名称: 手机号登录/查询用户
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/searchUsersIsExist`
- 请求方法: `GET`
- 接口描述: 根据手机号查询用户是否存在，若存在返回用户信息与登录 token

**请求参数（Request）**
- Headers
  - `authorization: Bearer `
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名 | 类型   |          示例 | 说明   |
| ------ | ------ | ------------: | ------ |
| phone  | string | `17777777777` | 手机号 |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": 200,
  "data": {
    "accountId": "d8f55f82984a45979e7bda2aa1c28172",
    "openId": null,
    "userName": "......",
    "avatar": "ld/avatar/ca90f9d41678c00d058deed263210fc31774774255407",
    "phone": "17777777777",
    "sex": "1",
    "birthDay": "1995-08-07T16:00:00.000Z",
    "height": "161",
    "targetWeight": "54",
    "weight": "53",
    "provinceName": null,
    "cityName": null,
    "areaName": null,
    "locationCode": null,
    "factory": null,
    "phoneType": "iPhone11,6",
    "createTime": "2025-11-10T10:39:45.000Z"
  },
  "token": "JWT_TOKEN"
}
```

| 字段名            | 类型   | 含义                        | 示例值                               |
| ----------------- | ------ | --------------------------- | ------------------------------------ |
| code              | number | 请求状态码                  | `200`                                |
| data              | object | 用户基础资料                | `{...}`                              |
| data.accountId    | string | 用户账号 ID                 | `"d8f55f82984a45979e7bda2aa1c28172"` |
| data.openId       | null   | 第三方开放平台 ID，样本为空 | `null`                               |
| data.userName     | string | 用户昵称                    | `"......"`                           |
| data.avatar       | string | 头像资源路径                | `"ld/avatar/..."`                    |
| data.phone        | string | 手机号                      | `"17777777777"`                      |
| data.sex          | string | 性别编码，推测 `1` 为男     | `"1"`                                |
| data.birthDay     | string | 出生日期时间                | `"1995-08-07T16:00:00.000Z"`         |
| data.height       | string | 身高，单位推测 cm           | `"161"`                              |
| data.targetWeight | string | 目标体重                    | `"54"`                               |
| data.weight       | string | 当前体重                    | `"53"`                               |
| data.provinceName | null   | 省份名称                    | `null`                               |
| data.cityName     | null   | 城市名称                    | `null`                               |
| data.areaName     | null   | 区县名称                    | `null`                               |
| data.locationCode | null   | 区域编码                    | `null`                               |
| data.factory      | null   | 设备厂商或来源，样本为空    | `null`                               |
| data.phoneType    | string | 手机型号                    | `"iPhone11,6"`                       |
| data.createTime   | string | 账号创建时间                | `"2025-11-10T10:39:45.000Z"`         |
| token             | string | 登录态 JWT Token            | `"JWT_TOKEN"`                        |

---

### 4. 根据账号 ID 查询用户是否存在
**接口基本信息**
- 接口名称: 按账号查询用户
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/searchUsersIsExistById`
- 请求方法: `GET`
- 接口描述: 根据 `accountId` 查询用户是否存在并返回用户基础资料

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名    | 类型   |                               示例 | 说明        |
| --------- | ------ | ---------------------------------: | ----------- |
| accountId | string | `d8f55f82984a45979e7bda2aa1c28172` | 用户账号 ID |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": 200,
  "data": {
    "accountId": "d8f55f82984a45979e7bda2aa1c28172",
    "openId": null,
    "userName": "......",
    "avatar": "ld/avatar/ca90f9d41678c00d058deed263210fc31774774255407",
    "phone": "17777777777",
    "sex": "1",
    "birthDay": "1995-08-07T16:00:00.000Z",
    "height": "161",
    "targetWeight": "54",
    "weight": "53",
    "provinceName": null,
    "cityName": null,
    "areaName": null,
    "locationCode": null,
    "factory": null,
    "phoneType": "iPhone11,6",
    "createTime": "2025-11-10T10:39:45.000Z"
  }
}
```

字段说明与 `searchUsersIsExist` 的 `data` 完全一致，不再重复解释。

---

### 5. 获取用户详情
**接口基本信息**
- 接口名称: 获取用户信息
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainUserInfo`
- 请求方法: `GET`
- 接口描述: 获取当前用户的详细资料，用于个人中心或资料编辑页初始化

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名    | 类型   |                               示例 | 说明        |
| --------- | ------ | ---------------------------------: | ----------- |
| accountId | string | `d8f55f82984a45979e7bda2aa1c28172` | 用户账号 ID |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "data": {
    "accountId": "d8f55f82984a45979e7bda2aa1c28172",
    "openId": null,
    "userName": "......",
    "avatar": "ld/avatar/ca90f9d41678c00d058deed263210fc31774774255407",
    "phone": "17777777777",
    "sex": "1",
    "birthDay": "1995-08-08",
    "height": "161",
    "targetWeight": "54",
    "weight": "53",
    "provinceName": null,
    "cityName": null,
    "areaName": null,
    "locationCode": null,
    "factory": null,
    "phoneType": "iPhone11,6",
    "createTime": "2025-11-10T10:39:45.000Z"
  },
  "code": 200
}
```

| 字段名            | 类型   | 含义          | 示例值                       |
| ----------------- | ------ | ------------- | ---------------------------- |
| data              | object | 用户详细资料  | `{...}`                      |
| data.accountId    | string | 用户账号 ID   | `"d8f55..."`                 |
| data.openId       | null   | 第三方 openId | `null`                       |
| data.userName     | string | 用户昵称      | `"......"`                   |
| data.avatar       | string | 头像路径      | `"ld/avatar/..."`            |
| data.phone        | string | 手机号        | `"17777777777"`              |
| data.sex          | string | 性别编码      | `"1"`                        |
| data.birthDay     | string | 出生日期      | `"1995-08-08"`               |
| data.height       | string | 身高          | `"161"`                      |
| data.targetWeight | string | 目标体重      | `"54"`                       |
| data.weight       | string | 当前体重      | `"53"`                       |
| data.provinceName | null   | 省份          | `null`                       |
| data.cityName     | null   | 城市          | `null`                       |
| data.areaName     | null   | 区域          | `null`                       |
| data.locationCode | null   | 地区编码      | `null`                       |
| data.factory      | null   | 厂商信息      | `null`                       |
| data.phoneType    | string | 手机型号      | `"iPhone11,6"`               |
| data.createTime   | string | 创建时间      | `"2025-11-10T10:39:45.000Z"` |
| code              | number | 请求状态码    | `200`                        |

---

### 6. 更新用户资料
**接口基本信息**
- 接口名称: 更新用户信息
- 请求地址: `POST http://data.mokfitness.cn/mokfitness/new/api/updataUserInfo`
- 请求方法: `POST`
- 接口描述: 更新用户头像、昵称、性别、生日、身高、体重等资料

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `content-type: application/x-www-form-urlencoded`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`

- Query 参数: 无
- Path 参数: 无

- Body 参数
  - 实际格式: `application/x-www-form-urlencoded`
  - 等价对象结构:

```json
{
  "avatar": "ld/avatar/ca90f9d41678c00d058deed263210fc31774774255407",
  "userName": "张三",
  "sex": "1",
  "birthDay": "1995-08-08",
  "height": "161",
  "weight": "53",
  "accountId": "d8f55f82984a45979e7bda2aa1c28172"
}
```

  - 表单编码示例:

```text
avatar=ld%2Favatar%2Fca90f9d41678c00d058deed263210fc31774774255407&userName=%E5%BC%A0%E4%B8%89&sex=1&birthDay=1995-08-08&height=161&weight=53&accountId=d8f55f82984a45979e7bda2aa1c28172
```

| 参数名    | 类型   |            示例 | 说明        |
| --------- | ------ | --------------: | ----------- |
| avatar    | string | `ld/avatar/...` | 头像路径    |
| userName  | string |          `张三` | 用户昵称    |
| sex       | string |             `1` | 性别编码    |
| birthDay  | string |    `1995-08-08` | 出生日期    |
| height    | string |           `161` | 身高        |
| weight    | string |            `53` | 当前体重    |
| accountId | string |      `d8f55...` | 用户账号 ID |

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": "200"
}
```

| 字段名 | 类型   | 含义       | 示例值  |
| ------ | ------ | ---------- | ------- |
| code   | string | 更新结果码 | `"200"` |

---

## 二、首页与汇总统计

### 7. 获取首页数据
**接口基本信息**
- 接口名称: 获取首页用户概览
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainHomePageData`
- 请求方法: `GET`
- 接口描述: 获取首页展示所需的用户资料与累计运动汇总数据

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名     | 类型   |                               示例 | 说明        |
| ---------- | ------ | ---------------------------------: | ----------- |
| accountId  | string | `d8f55f82984a45979e7bda2aa1c28172` | 用户账号 ID |
| deviceType | number |                                `2` | 设备类型    |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": "200",
  "data": {
    "accountId": "d8f55f82984a45979e7bda2aa1c28172",
    "openId": null,
    "userName": "......",
    "avatar": "ld/avatar/ca90f9d41678c00d058deed263210fc31774774255407",
    "phone": "17777777777",
    "sex": "1",
    "birthDay": "1995-08-07T16:00:00.000Z",
    "height": "161",
    "targetWeight": "54",
    "weight": "53",
    "provinceName": null,
    "cityName": null,
    "areaName": null,
    "locationCode": null,
    "factory": null,
    "phoneType": "iPhone11,6",
    "createTime": "2025-11-10T10:39:45.000Z",
    "_id": "d8f55f82984a45979e7bda2aa1c28172",
    "sumCalorie": 0,
    "sumDuration": 0,
    "sumMileage": 0
  }
}
```

| 字段名            | 类型   | 含义                       | 示例值                       |
| ----------------- | ------ | -------------------------- | ---------------------------- |
| code              | string | 请求状态码                 | `"200"`                      |
| data              | object | 首页概览数据               | `{...}`                      |
| data.accountId    | string | 用户账号 ID                | `"d8f55..."`                 |
| data.openId       | null   | 第三方 openId              | `null`                       |
| data.userName     | string | 用户昵称                   | `"......"`                   |
| data.avatar       | string | 头像路径                   | `"ld/avatar/..."`            |
| data.phone        | string | 手机号                     | `"17777777777"`              |
| data.sex          | string | 性别编码                   | `"1"`                        |
| data.birthDay     | string | 生日                       | `"1995-08-07T16:00:00.000Z"` |
| data.height       | string | 身高                       | `"161"`                      |
| data.targetWeight | string | 目标体重                   | `"54"`                       |
| data.weight       | string | 当前体重                   | `"53"`                       |
| data.provinceName | null   | 省份                       | `null`                       |
| data.cityName     | null   | 城市                       | `null`                       |
| data.areaName     | null   | 区域                       | `null`                       |
| data.locationCode | null   | 地区编码                   | `null`                       |
| data.factory      | null   | 厂商信息                   | `null`                       |
| data.phoneType    | string | 手机型号                   | `"iPhone11,6"`               |
| data.createTime   | string | 注册时间                   | `"2025-11-10T10:39:45.000Z"` |
| data._id          | string | 记录主键/用户主键          | `"d8f55..."`                 |
| data.sumCalorie   | number | 累计消耗卡路里             | `0`                          |
| data.sumDuration  | number | 累计运动时长，单位推测秒   | `0`                          |
| data.sumMileage   | number | 累计运动里程，单位推测公里 | `0`                          |

---

### 8. 获取全部累计运动数据
**接口基本信息**
- 接口名称: 获取总运动统计
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainSportDataInAll`
- 请求方法: `GET`
- 接口描述: 获取当前账号在某设备类型下的全量累计运动统计

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名     | 类型   |       示例 | 说明        |
| ---------- | ------ | ---------: | ----------- |
| accountId  | string | `d8f55...` | 用户账号 ID |
| deviceType | number |        `2` | 设备类型    |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": 200,
  "data": {
    "_id": "d8f55f82984a45979e7bda2aa1c28172",
    "totalDistance": 190.99,
    "totalCalorie": 13495,
    "totalDuration": 64761
  }
}
```

| 字段名             | 类型   | 含义                   | 示例值       |
| ------------------ | ------ | ---------------------- | ------------ |
| code               | number | 请求状态码             | `200`        |
| data               | object | 总体汇总数据           | `{...}`      |
| data._id           | string | 用户或汇总记录主键     | `"d8f55..."` |
| data.totalDistance | number | 总里程，单位推测公里   | `190.99`     |
| data.totalCalorie  | number | 总消耗卡路里           | `13495`      |
| data.totalDuration | number | 总运动时长，单位推测秒 | `64761`      |

---

## 三、运动记录与明细

### 9. 获取运动汇总列表
**接口基本信息**
- 接口名称: 获取运动统计列表
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainUserSporTotalListByDeviceType`
- 请求方法: `GET`
- 接口描述: 按日、周、月维度返回运动汇总列表，适合图表或历史列表展示

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名     | 类型   |            示例 | 说明                                  |
| ---------- | ------ | --------------: | ------------------------------------- |
| page       | number |             `1` | 页码                                  |
| type       | number | `1` / `2` / `3` | 统计粒度，推测 `1=日`、`2=周`、`3=月` |
| deviceType | number |             `2` | 设备类型                              |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

日维度示例:
```json
{
  "code": "200",
  "data": [
    { "_id": "2026-03-31", "totalDistance": 0 },
    { "_id": "2026-03-30", "totalDistance": 2.8 }
  ]
}
```

周维度示例:
```json
{
  "code": "200",
  "data": [
    { "_id": "2026-03-30/2026-04-05", "totalDistance": 2.8 },
    { "_id": "2026-03-23/2026-03-29", "totalDistance": 14.75 }
  ]
}
```

月维度示例:
```json
{
  "code": "200",
  "data": [
    { "_id": "2026-03", "totalDistance": 27.34 },
    { "_id": "2026-02", "totalDistance": 0 }
  ]
}
```

| 字段名               | 类型   | 含义                          | 示例值                    |
| -------------------- | ------ | ----------------------------- | ------------------------- |
| code                 | string | 请求状态码                    | `"200"`                   |
| data                 | array  | 汇总列表                      | `[{...}]`                 |
| data[]. _id          | string | 统计周期标识，格式依赖 `type` | `"2026-03-30/2026-04-05"` |
| data[].totalDistance | number | 该周期总里程                  | `14.75`                   |

---

### 10. 获取某统计周期的汇总详情
**接口基本信息**
- 接口名称: 获取周期运动汇总
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainUserSporTotalByType`
- 请求方法: `GET`
- 接口描述: 按日/周/月维度获取某个条件下的总距离、总卡路里、总时长、次数

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名     | 类型   |                                            示例 | 说明                                  |
| ---------- | ------ | ----------------------------------------------: | ------------------------------------- |
| accountId  | string |                                      `d8f55...` | 用户账号 ID                           |
| type       | number |                                 `1` / `2` / `3` | 统计粒度，推测 `1=日`、`2=周`、`3=月` |
| deviceType | number |                                             `2` | 设备类型                              |
| condition  | string | `1` / `0` / `2026-03` / `2026-03-23/2026-03-29` | 查询条件，格式依粒度变化              |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

非空示例:
```json
{
  "code": 200,
  "data": {
    "_id": "2026-03",
    "totalDistance": 27.34,
    "totalCalorie": 1917,
    "totalDuration": 7443,
    "sportCount": 10
  }
}
```

空数据示例:
```json
{
  "code": 200,
  "data": {
    "totalCalorie": 0,
    "totalDistance": 0,
    "totalDuration": 0,
    "sportCount": 0
  }
}
```

| 字段名             | 类型   | 含义                         | 示例值      |
| ------------------ | ------ | ---------------------------- | ----------- |
| code               | number | 请求状态码                   | `200`       |
| data               | object | 周期汇总结果                 | `{...}`     |
| data._id           | string | 周期标识，空数据场景可能缺失 | `"2026-03"` |
| data.totalDistance | number | 总里程                       | `27.34`     |
| data.totalCalorie  | number | 总卡路里                     | `1917`      |
| data.totalDuration | number | 总时长                       | `7443`      |
| data.sportCount    | number | 运动次数                     | `10`        |

---

### 11. 获取某统计周期下的运动记录列表
**接口基本信息**
- 接口名称: 获取周期运动明细列表
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainSportDataByDay`
- 请求方法: `GET`
- 接口描述: 根据统计粒度与条件获取具体运动记录，返回按月份分组的明细

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名     | 类型   |                                            示例 | 说明        |
| ---------- | ------ | ----------------------------------------------: | ----------- |
| accountId  | string |                                      `d8f55...` | 用户账号 ID |
| page       | number |                                             `1` | 页码        |
| type       | number |                                 `1` / `2` / `3` | 统计粒度    |
| deviceType | number |                                             `2` | 设备类型    |
| condition  | string | `1` / `0` / `2026-03` / `2026-03-23/2026-03-29` | 查询条件    |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

空结果示例:
```json
{
  "code": 200,
  "data": []
}
```

非空示例:
```json
{
  "code": 200,
  "data": [
    {
      "_id": "2026-03",
      "dayData": [
        {
          "_id": "69ca163fa3ef2b13719eedc1",
          "accountId": "d8f55f82984a45979e7bda2aa1c28172",
          "deviceType": "2",
          "sumMileage": 2.8,
          "sumCalorie": 200,
          "sumDuration": 821,
          "startTime": "2026-03-30 14:03:47.937197",
          "turns": "409",
          "paceList": "7.59,13.86,16.8,...",
          "rpmList": "23,33,35,...",
          "createTime": "2026-03-30T14:20:47.443Z",
          "day": "2026-03-30",
          "year": "2026",
          "month": "2026-03"
        }
      ]
    }
  ]
}
```

| 字段名                       | 类型   | 含义                        | 示例值                         |
| ---------------------------- | ------ | --------------------------- | ------------------------------ |
| code                         | number | 请求状态码                  | `200`                          |
| data                         | array  | 月份分组列表                | `[{...}]`                      |
| data[]._id                   | string | 月份分组标识                | `"2026-03"`                    |
| data[].dayData               | array  | 该月下的运动记录列表        | `[{...}]`                      |
| data[].dayData[]._id         | string | 运动记录 ID                 | `"69ca163fa3ef2b13719eedc1"`   |
| data[].dayData[].accountId   | string | 用户账号 ID                 | `"d8f55..."`                   |
| data[].dayData[].deviceType  | string | 设备类型                    | `"2"`                          |
| data[].dayData[].sumMileage  | number | 本次运动里程                | `2.8`                          |
| data[].dayData[].sumCalorie  | number | 本次运动卡路里              | `200`                          |
| data[].dayData[].sumDuration | number | 本次运动时长                | `821`                          |
| data[].dayData[].startTime   | string | 运动开始时间                | `"2026-03-30 14:03:47.937197"` |
| data[].dayData[].turns       | string | 踏频总圈数或总转数          | `"409"`                        |
| data[].dayData[].paceList    | string | 配速/速度采样序列，逗号分隔 | `"7.59,13.86,16.8"`            |
| data[].dayData[].rpmList     | string | RPM 采样序列，逗号分隔      | `"23,33,35"`                   |
| data[].dayData[].createTime  | string | 记录写入时间                | `"2026-03-30T14:20:47.443Z"`   |
| data[].dayData[].day         | string | 日期                        | `"2026-03-30"`                 |
| data[].dayData[].year        | string | 年份                        | `"2026"`                       |
| data[].dayData[].month       | string | 月份                        | `"2026-03"`                    |

---

### 12. 获取运动记录详情
**接口基本信息**
- 接口名称: 获取运动详情
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainSportDetailById`
- 请求方法: `GET`
- 接口描述: 根据 `sportId` 获取单次运动的完整记录明细

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名  | 类型   |                       示例 | 说明        |
| ------- | ------ | -------------------------: | ----------- |
| sportId | string | `69c60634a3ef2b13719ed4a3` | 运动记录 ID |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": 200,
  "data": {
    "_id": "69c60634a3ef2b13719ed4a3",
    "accountId": "d8f55f82984a45979e7bda2aa1c28172",
    "deviceType": "2",
    "sumMileage": 2.86,
    "sumCalorie": 200,
    "sumDuration": 756,
    "startTime": "2026-03-27 12:05:30.754371",
    "turns": "404",
    "paceList": "0.0",
    "rpmList": "0",
    "createTime": "2026-03-27T12:23:16.223Z",
    "day": "2026-03-27",
    "year": "2026",
    "month": "2026-03"
  }
}
```

| 字段名           | 类型   | 含义             | 示例值                         |
| ---------------- | ------ | ---------------- | ------------------------------ |
| code             | number | 请求状态码       | `200`                          |
| data             | object | 单次运动记录详情 | `{...}`                        |
| data._id         | string | 运动记录 ID      | `"69c60634a3ef2b13719ed4a3"`   |
| data.accountId   | string | 用户账号 ID      | `"d8f55..."`                   |
| data.deviceType  | string | 设备类型         | `"2"`                          |
| data.sumMileage  | number | 里程             | `2.86`                         |
| data.sumCalorie  | number | 卡路里           | `200`                          |
| data.sumDuration | number | 时长             | `756`                          |
| data.startTime   | string | 开始时间         | `"2026-03-27 12:05:30.754371"` |
| data.turns       | string | 总转数           | `"404"`                        |
| data.paceList    | string | 配速/速度序列    | `"0.0"`                        |
| data.rpmList     | string | RPM 序列         | `"0"`                          |
| data.createTime  | string | 创建时间         | `"2026-03-27T12:23:16.223Z"`   |
| data.day         | string | 日期             | `"2026-03-27"`                 |
| data.year        | string | 年份             | `"2026"`                       |
| data.month       | string | 月份             | `"2026-03"`                    |

---

## 四、资源内容

### 13. 获取骑行风景视频列表
**接口基本信息**
- 接口名称: 获取骑行风景视频
- 请求地址: `GET http://data.mokfitness.cn/mokfitness/new/api/obtainBikeSceneryVedioList`
- 请求方法: `GET`
- 接口描述: 获取骑行场景视频资源列表，用于沉浸式骑行播放页

**请求参数（Request）**
- Headers
  - `authorization: Bearer <token>`
  - `user-agent: Dart/3.10 (dart:io)`
  - `Accept-Encoding: gzip, deflate, br`
  - `host: data.mokfitness.cn`
  - `Connection: keep-alive`
- Query 参数

| 参数名    | 类型   |       示例 | 说明        |
| --------- | ------ | ---------: | ----------- |
| accountId | string | `d8f55...` | 用户账号 ID |

- Path 参数: 无
- Body 参数: 无

**返回数据（Response）**
- HTTP 状态码: `200`

```json
{
  "code": 200,
  "data": [
    {
      "_id": "67130c474ee1eb37e393ddd7",
      "createTime": "2024-10-19",
      "cover": "http://mokvedio.lvd.fit/sceneImages/2025-08-211.png",
      "url": "http://mokvedio.lvd.fit/mokSceneVedio/bike2025-08-20-20min-1.mp4",
      "videoName": "...........................",
      "deviceType": "1"
    }
  ]
}
```

| 字段名            | 类型   | 含义         | 示例值                                        |
| ----------------- | ------ | ------------ | --------------------------------------------- |
| code              | number | 请求状态码   | `200`                                         |
| data              | array  | 视频资源列表 | `[{...}]`                                     |
| data[]._id        | string | 视频资源 ID  | `"67130c..."`                                 |
| data[].createTime | string | 资源创建日期 | `"2024-10-19"`                                |
| data[].cover      | string | 封面图 URL   | `"http://mokvedio.lvd.fit/sceneImages/..."`   |
| data[].url        | string | 视频文件 URL | `"http://mokvedio.lvd.fit/mokSceneVedio/..."` |
| data[].videoName  | string | 视频名称     | `"..........................."`               |
| data[].deviceType | string | 适配设备类型 | `"1"`                                         |

---

## 五、可复用数据模型

```ts
type ApiCode = string | number;

interface ApiSuccess<T> {
  code: ApiCode;
  data?: T;
  token?: string;
}

interface UserProfile {
  accountId: string;
  openId: string | null;
  userName: string;
  avatar: string;
  phone: string;
  sex: string;
  birthDay: string;
  height: string;
  targetWeight: string;
  weight: string;
  provinceName: string | null;
  cityName: string | null;
  areaName: string | null;
  locationCode: string | null;
  factory: string | null;
  phoneType: string;
  createTime: string;
}

interface HomePageData extends UserProfile {
  _id: string;
  sumCalorie: number;
  sumDuration: number;
  sumMileage: number;
}

interface VerifyCodeData {
  code: string;
}

interface TotalSportStats {
  _id?: string;
  totalDistance: number;
  totalCalorie: number;
  totalDuration: number;
  sportCount?: number;
}

interface TotalSportAllData {
  _id: string;
  totalDistance: number;
  totalCalorie: number;
  totalDuration: number;
}

interface PeriodDistanceItem {
  _id: string;
  totalDistance: number;
}

interface SportRecord {
  _id: string;
  accountId: string;
  deviceType: string;
  sumMileage: number;
  sumCalorie: number;
  sumDuration: number;
  startTime: string;
  turns: string;
  paceList: string;
  rpmList: string;
  createTime: string;
  day: string;
  year: string;
  month: string;
}

interface SportRecordMonthGroup {
  _id: string;
  dayData: SportRecord[];
}

interface BikeSceneryVideo {
  _id: string;
  createTime: string;
  cover: string;
  url: string;
  videoName: string;
  deviceType: string;
}

interface UpdateUserInfoBody {
  avatar: string;
  userName: string;
  sex: string;
  birthDay: string;
  height: string;
  weight: string;
  accountId: string;
}
```

## 六、给前端、后端、AI 调用的补充建议

- `type` 字段建议统一解释为:
  - `1`: 日维度
  - `2`: 周维度
  - `3`: 月维度
- `condition` 字段格式需按 `type` 切换:
  - 日维度样本: `1`
  - 周维度样本: `0` 或 `2026-03-23/2026-03-29`
  - 月维度样本: `0` 或 `2026-03`
- 多个接口把数值放在字符串中，例如 `sex`、`height`、`weight`、`deviceType`、`turns`，调用方不要强依赖严格数值类型
- `paceList` 与 `rpmList` 当前返回逗号分隔字符串，若前端需要图表，建议先 split 成数组
- `obtainFeigeCode` 返回明文验证码，生产环境通常不应直接暴露，后端联调时应注意安全控制
- `updataUserInfo` 实际是表单提交，不是 JSON 提交，AI 自动调用时必须设置 `Content-Type: application/x-www-form-urlencoded`
