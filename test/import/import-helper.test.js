/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { expect, use } from 'chai';
import esmock from 'esmock';
import sinon from 'sinon';
import { runImportJobAndPoll } from '../../src/import/import-helper.js';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('Import helper tests', () => {
  let fetchStub;

  const exampleParamObject = {
    urls: ['https://example.com/path/to/resource-1', 'https://example.com/path/to/resource-2'],
  }

  beforeEach(() => {
    // Mock the built-in fetch
    fetchStub = sinon.stub(globalThis, 'fetch')
    fetchStub.callsFake((url, options) => {
      const requestBody = JSON.parse(options.body);

    });

  });

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  describe('runImportJobAndPoll tests', () => {
    it ('should fail when required params are missing', async () => {
      const testParams = {
        urls: [],
      };
      await expect(runImportJobAndPoll(testParams)).to.be.rejectedWith(Error, 'No URLs provided');

      testParams.urls = null;
      await expect(runImportJobAndPoll(testParams)).to.be.rejectedWith(Error, 'No URLs provided');
    });

    it ('should create a new job', async () => {
      await expect(runImportJobAndPoll(exampleParamObject)).to.be.rejectedWith(Error, 'No URLs provided');
    });
  });
});
