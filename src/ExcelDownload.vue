<template>
  <div class="vue-excel-download-btn--container">
    <a ref="vueExcelDownloadBtnHidden" style="display: none"></a>
    <button class="vue-excel-download-btn" @click="onDownloadBtnClicked" :disabled="isDownloading">
      <slot></slot>
    </button>
  </div>
</template>

<script>

  import axios from 'axios';

  const base64 = function (s) {
    return window.btoa(unescape(encodeURIComponent(s)));
  };

  export default {
    name: 'VueExcelDownload',
    data () {
    return {
      downloadData: [],
      isDownloading: false
    };
  },
  props: {
    apiUrl: String,
      data: Array,
      columns: {
      type: Array,
        required: true
    },
    options: Object
  },
  methods: {
    onDownloadBtnClicked () {
      if (this.apiUrl && this.apiUrl.length) {
        this.fetchData();
      } else {
        this.downloadData = this.data.slice(0);
        this.downloadExcel();
      }
    },
    fetchData () {
      this.$emit('dataFetchStart');
      this.isDownloading = true;
      axios.get(this.apiUrl)
        .then((response) => {
        const accessor = this.options && this.options.apiDataAccessor ? this.options.apiDataAccessor : '';
      const dataModifierCallback = this.options && this.options.dataModifier ? this.options.dataModifier : x => x;
      const resultData = accessor && accessor.length ? response.data[accessor] : response.data;

      this.downloadData = dataModifierCallback(resultData);
      this.downloadExcel();
      this.isDownloading = false;
      this.$emit('dataFetchEnd');
    });
  },
  getHeaderXML () {
    let headerXML = '<tr>\n';

    this.columns.forEach(col => {
      headerXML += `<th>\n${col.title}\n</th>\n`;
  });

  headerXML += '</tr>\n';

  return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>\n' +
  `<thead>\n\n${headerXML}</thead>\n\n</tbody>\n`;
  },
  getBodyXML () {
    let bodyXML = '';

    this.downloadData.forEach(row => {
      bodyXML += '<tr>\n';

    this.columns.forEach(header => {
      const keys = header.key.split('.');
    let val = row;

    keys.forEach(key => {
      val = val[key];
  });

  bodyXML += `<td>\n${val}\n</td>\n`;
  });

  bodyXML += '</tr>\n';
  });

  return bodyXML;
  },
  getFooterXML () {
    return `\n</tbody>\n</table>\n</body>\n</html>\n`;
  },
  downloadExcel () {
    const uri = 'data:application/vnd.ms-excel;base64,';
    const htmlData = this.getHeaderXML() + this.getBodyXML() + this.getFooterXML();
    const anchor = this.$refs.vueExcelDownloadBtnHidden;

    anchor.href = uri + base64(htmlData);
    anchor.download = this.options && this.options.fileName ? `${this.options.fileName}.xls` : 'Data.xls';
    anchor.click();
  }
  }
  };
</script>

<style scoped>
  button {
    width: 120px;
    height: 40px;
    cursor: pointer;
    border: 1px solid lightgrey;
    background: lightgrey;
    border-radius: 4px;
    outline: none;
    font-size: 0.8em;
    color: darkslategrey;
  }

  button[disabled] {
    cursor: not-allowed;
  }
</style>
