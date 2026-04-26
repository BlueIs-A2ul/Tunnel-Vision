<script setup lang="ts">
defineProps<{
  title: string
  columns: { key: string; label: string }[]
  data: { rank: number;[key: string]: string | number }[]
  unit?: string
}>()
</script>

<template>
  <div class="table-wrapper">
    <div class="table-title">
      <i class="title_icon"></i>{{ title }}
    </div>
    <div class="table_p">
      <table>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in data" :key="record.rank">
            <td v-for="col in columns" :key="col.key">
              {{ record[col.key] }}{{ col.key !== 'rank' && col.key !== 'plate' ? unit : '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  height: 280px;
  box-shadow: -10px 0px 15px #034c6a inset,
    0px -10px 15px #034c6a inset,
    10px 0px 15px #034c6a inset,
    0px 10px 15px #034c6a inset;
  border: 1px solid #034c6a;
  box-sizing: border-box;
  position: relative;
  margin-top: 25px;
}

.table-title {
  background-color: #034c6a;
  border-radius: 18px;
  position: absolute;
  height: 35px;
  width: 80%;
  top: -15px;
  color: #ffffff;
  font-weight: bold;
  font-size: 14px;
  left: 10%;
  line-height: 35px;
  text-align: center;
}

.title_icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  position: relative;
  top: 2px;
  margin-right: 5px;
  background: #ffffff no-repeat center;
  background-size: contain;
}

.table_p {
  height: 93%;
  margin-top: 7%;
  position: relative;
  overflow: hidden;
}

.table_p table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  text-align: center;
}

.table_p table thead th {
  color: #61d2f7;
  font-size: 14px;
  font-weight: 600;
  padding-top: 5px;
  padding-bottom: 5px;
}

.table_p table tbody {
  color: #ffffff;
  font-size: 13px;
}

.table_p table tbody tr:nth-child(2n+1) {
  background-color: #072951;
  box-shadow: -10px 0px 15px #034c6a inset,
    10px 0px 15px #034c6a inset;
}

.table_p table tbody tr:hover {
  background-color: rgba(75, 141, 248, 0.3);
}
</style>