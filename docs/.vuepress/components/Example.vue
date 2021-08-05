<!--
  - Copyright 2021 LABOR.digital
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -     http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  - Last modified: 2021.03.14 at 00:43
  -->

<template>
  <div class="preview">
    <a :href="href" class="preview__link" target="_blank">Open the example in a new tab</a>
    <iframe :src="href" :style="{'height': height + 'px'}" ref="frame"></iframe>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Example',
  props: {
    href: String,
    height: {
      type: Number,
      default: 300
    }
  },
  data: function () {
    return {
      timeout: 0
    };
  },
  mounted()
  {
    this.$refs.frame.onload = () => {
      const doc = this.$refs.frame.contentDocument;
      doc.body.innerHTML = doc.body.innerHTML + '<style>.container {' +
                           'max-width: 100% !important;' +
                           'margin: 0!important;' +
                           'width: 100%!important;}</style>';

      const heightSetter = () => {
        if (!this.$refs.frame) {
          return;
        }

        this.$refs.frame.height = '';
        this.$refs.frame.height = this.$refs.frame.contentWindow.document.body.scrollHeight + 'px';
      };
      this.timeout = setInterval(() => heightSetter(), 500);
    };
  },
  beforeDestroy()
  {
    clearTimeout(this.timeout);
  }
};
</script>

<style scoped>
.preview {
  width: 100%
}

.preview iframe {
  width: 100%;
  border: 1px solid #eaecef;
  margin-top: 4px
}
</style>