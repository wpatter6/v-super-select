<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <section>
      <h3>Using Default Slot with Select-Style options:</h3>
      <v-super-select label="options">
        <option value="1">First Option</option>
        <option value="2">Second Option</option>
      </v-super-select>
      <h3>Using Items from Data:</h3>
      <v-super-select label="data" :items="flatItems"></v-super-select>
      <h3>Using Grouped Items from Data:</h3>
      <v-super-select label="group data" :items="groupedItems"></v-super-select>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VSuperSelect from './components/VSuperSelect.vue'

export default Vue.extend({
  name: 'app',
  data() {
    return {
      flatItems: [
        {
          text: 'First Item',
          value: '1',
        },
        {
          text: 'Second Item',
          value: '2',
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
