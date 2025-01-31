import { Injectable } from '@angular/core';
import { ApiBodyType } from 'eo/workbench/browser/src/app/modules/api-shared/api.model';
import { ApiTestUtilService } from 'eo/workbench/browser/src/app/pages/workspace/project/api/service/api-test-util.service';
import { syncUrlAndQuery } from 'eo/workbench/browser/src/app/pages/workspace/project/api/utils/api.utils';
import { ApiService } from 'eo/workbench/browser/src/app/shared/services/storage/api.service';
import { ApiData } from 'eo/workbench/browser/src/app/shared/services/storage/db/models';
import { StoreService } from 'eo/workbench/browser/src/app/shared/store/state.service';
import { json2xml, table2json } from 'eo/workbench/browser/src/app/utils/data-transfer/data-transfer.utils';

@Injectable()
export class ApiMockService {
  constructor(private api: ApiService, private store: StoreService, private testUtils: ApiTestUtilService) {
    console.log('init api mock service');
  }
  getMockPrefix(apiData) {
    const uri = syncUrlAndQuery(this.testUtils.formatUri(apiData.uri, apiData.restParams), apiData.queryParams).url;
    return `${this.store.mockUrl}/${uri}`;
  }

  /**
   * get mock list
   *
   * @param apiUuid
   * @returns
   */
  async getMocks(apiUuid: string) {
    const [data, err] = await this.api.api_mockList({
      apiUuid,
      page: 1,
      pageSize: 200
    });
    return data?.items || [];
  }
  /**
   * create mock
   *
   * @param mock
   * @returns
   */
  async createMock(mock) {
    return await this.api.api_mockCreate(mock);
  }
  /**
   * update mock
   *
   * @param mock
   * @returns
   */
  async updateMock(mockData) {
    const [data, err] = await this.api.api_mockUpdate(mockData);
    return data;
  }
  async deleteMock(id: number) {
    console.log(id);
    const [data, err] = await this.api.api_mockDelete({ id });
    return data;
  }
  getMockResponseByAPI(apiData: ApiData) {
    switch (apiData.responseList?.[0].contentType) {
      case ApiBodyType.Raw:
      case ApiBodyType.Binary: {
        return apiData.responseList?.[0]?.responseParams?.bodyParams?.[0]?.binaryRawData || '';
      }
      case ApiBodyType.JSON:
      case ApiBodyType.JSONArray: {
        const body = apiData.responseList?.[0]?.responseParams?.bodyParams;
        return JSON.stringify(table2json(body));
      }
      case ApiBodyType.XML: {
        const body = apiData.responseList?.[0]?.responseParams?.bodyParams;
        return json2xml(table2json(body));
      }
    }
  }
}
