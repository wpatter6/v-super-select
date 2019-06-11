import { shallowMount } from '@vue/test-utils'
import VSuperSelect from '@/VSuperSelect.vue'

interface SelectItem {
  text: string
  value: string
}

describe('VSuperSelect.vue', () => {
  it('will match snapshot', () => {
    const wrapper = shallowMount(VSuperSelect, {
      propsData: {
        items: createItems(),
      },
    })

    expect(wrapper).toMatchSnapshot()
  })

  it('will match snapshot 2', () => {
    const wrapper = shallowMount(VSuperSelect, {
      propsData: {
        items: createItems(20),
      },
    })

    expect(wrapper).toMatchSnapshot('2')
  })
})

const createItems = (count = 3): SelectItem[] => {
  return Array(count)
    .join()
    .split(',')
    .map((u, i) => ({
      text: `Item ${i}`,
      value: btoa(i + ''),
    }))
}
