import { BaseApi } from './base.api.js';

export class MetadataApi extends BaseApi {
  async getAgeGroups() {
    return this.get('/metadata/age-groups');
  }

  async getSkills() {
    return this.get('/metadata/skills');
  }

  async getFormData() {
    return this.get('/metadata/form-data');
  }
}

export const metadataApi = new MetadataApi();
