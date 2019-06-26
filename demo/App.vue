<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <section>
      <h3>Disabled:</h3>
      <v-super-select disabled label="disabled">
        <option value="1">First Option</option>
        <option value="2">Second Option</option>
      </v-super-select>
      <h3>Using Default Slot with Select-Style options:</h3>
      <v-super-select
        native-mobile
        label="options"
        mobile-header-background-color="#006643"
        mobile-header-border-bottom="linear-gradient(to right, #006643 0%, #00a8e3 94%, #00acec 100%)"
      >
        <option value="1">First Option</option>
        <option value="2">Second Option</option>
      </v-super-select>
      <h3>Using Items from Data:</h3>
      <v-super-select
        label="data"
        :items="flatItems"
        mobile-header-background-color="#006643"
        mobile-header-border-bottom="linear-gradient(to right, #006643 0%, #00a8e3 94%, #00acec 100%)"
      ></v-super-select>
      <h3>Using Grouped Items from Data:</h3>
      <v-super-select
        label="group data"
        :items="groupedItems"
        mobile-header-background-color="#006643"
        mobile-header-border-bottom="linear-gradient(to right, #006643 0%, #00a8e3 94%, #00acec 100%)"
      ></v-super-select>
      <h3>2000 Grouped Items Virtual Scrolling:</h3>
      <v-super-select
        label="virtual scrolling"
        :items="virtualScrollItems"
        mobile-header-background-color="#006643"
        mobile-header-border-bottom="linear-gradient(to right, #006643 0%, #00a8e3 94%, #00acec 100%)"
      ></v-super-select>
      <h3>Using Irregular Data</h3>
      <v-super-select
        label="irregular data"
        :items="irregularItems"
        text-field="friendlyText"
        value-field="code"
        group-name-field="headerText"
        children-field="children"
        v-model="irregularValue"
        mobile-header-background-color="#006643"
        mobile-header-border-bottom="linear-gradient(to right, #006643 0%, #00a8e3 94%, #00acec 100%)"
      ></v-super-select>
      <div>{{ JSON.stringify(irregularValue) }}</div>
      <h3>With Loading Spinner</h3>
      <v-super-select
        label="loading example"
        :loading="loading"
        :items="flatItems"
        mobile-header-background-color="#006643"
        mobile-header-border-bottom="linear-gradient(to right, #006643 0%, #00a8e3 94%, #00acec 100%)"
      ></v-super-select>
      <div>
        <button @click="loading = !loading">Toggle Loading</button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VSuperSelect from '../src/VSuperSelect.vue'

export default Vue.extend({
  name: 'app',
  data() {
    return {
      loading: true,
      flatItems: [
        {
          text: 'Denver, CO',
          value: '1',
          iconUrl: require('./assets/nearby-icon.png'),
        },
        {
          text: 'St. Louis, MO',
          value: '2',
          iconUrl: require('./assets/nearby-icon.png'),
        },
      ],
      groupedItems: [
        {
          groupName: 'Group 1',
          items: [
            {
              text: 'First Group First Item',
              value: '1',
            },
            {
              text: 'First Group Second Item',
              value: '2',
            },
          ],
        },
        {
          groupName: 'Group 2',
          items: [
            {
              text: 'Second Group First Item',
              value: '3',
            },
            {
              text: 'Second Group Second Item',
              value: '4',
            },
          ],
        },
      ],
      virtualScrollItems: Array(100)
        .join()
        .split(',')
        .map((u, i) => ({
          groupName: 'Group ' + i,
          items: Array(20)
            .join()
            .split(',')
            .map((v, j) => ({
              text: 'Group ' + i + ' Item ' + j,
              value: 'g' + i + 'i' + j,
            })),
        })),
      irregularItems: [
        {
          headerText: 'Header Text 1',
          children: [
            {
              code: 'ABC',
              friendlyText: 'Friendly Text 1',
            },
            {
              code: 'DEF',
              friendlyText: 'Friendly Text 2',
            },
            {
              code: 'GHI',
              friendlyText: 'Friendly Text 3',
            },
          ],
        },
        {
          headerText: 'Header Text 2',
          children: [
            {
              code: 'JKL',
              friendlyText: 'Friendly Text 4',
            },
            {
              code: 'MNO',
              friendlyText: 'Friendly Text 5',
            },
            {
              code: 'PQR',
              friendlyText: 'Friendly Text 6',
            },
          ],
        },
      ],
      irregularValue: null,
    }
  },
  components: {
    VSuperSelect,
  },
})
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    h3 {
      align-self: flex-start;
    }
  }
}
</style>
