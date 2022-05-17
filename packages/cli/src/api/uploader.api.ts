import axios from 'axios';
import * as FormData from 'form-data';
import { createReadStream, unlinkSync } from 'fs';

const API_BASE_URL = process.env.API_BASE_URL || 'http://51.15.116.231:3010';

// up!
export class UploaderApi {

  private jwt: string;

  async login(address: string, wif: string) {
    let response: any;

    try {
      response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          address,
          wif,
        },
      );
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }

    console.log('Login success!!!');

    const jwt = response.data?.jwt;

    if (!jwt) {
      throw new Error('Cannot login to uploader');
    }

    this.jwt = jwt;
  }

  async uploadProject(projectId: string, path: string, manifest: string) {
    const form = new FormData();

    console.log(`project ${projectId} upload started...`);



    form.append('file', createReadStream(path));
    form.append('manifest', manifest);
    form.append('projectId', projectId);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/uploader/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.jwt}`,
          },
        },
      );

      console.log(`file ${path} upload finished ${JSON.stringify(response.status)}`);

      unlinkSync(path);
    } catch (e) {
      console.log(`file ${path} upload failed`);
    }
  }
}
