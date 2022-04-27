import axios from "axios";
import * as FormData from 'form-data';
import {unlinkSync} from "fs";


export class UploaderApi {

  private jwt: string;

  async login(address: string, wif: string) {
    let response: any;

    try {
      response = await axios.post(
        'http://localhost:3010/auth/login', // TODO: move to config
        {
          address,
          wif,
        },
      );
    } catch(e) {
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

    form.append('file', path, {
      filename: 'project.zip',
    });

    form.append('manifest', manifest);
    form.append('projectId', projectId);

    try {
      const response = await axios.post(
        'http://localhost:3010/uploader/upload', // TODO: move to config
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
    } catch(e) {
      console.log(`file ${path} upload failed`);
    }
  }
}
