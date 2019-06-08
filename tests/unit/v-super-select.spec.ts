import { shallowMount } from '@vue/test-utils'
import VSuperSelect from '@/components/VSuperSelect.vue'

describe('VSuperSelect.vue', () => {
  it('will match snapshot', () => {
    const wrapper = shallowMount(VSuperSelect, {
      propsData: {
        items: [
          {
            text: 'Item 1',
            value: '1',
          },
          {
            text: 'Item 2',
            value: '2',
          },
        ],
      },
    })

    expect(wrapper).toMatchSnapshot()
  })
})
