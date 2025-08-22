import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusChip from '../StatusChip.vue'

describe('StatusChip', () => {
  it('formats DRAFT status correctly', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'DRAFT' },
    })
    expect(wrapper.text()).toBe('Draft')
  })

  it('formats PENDING_APPROVAL status correctly', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'PENDING_APPROVAL' },
    })
    expect(wrapper.text()).toBe('Pending Approval')
  })

  it('formats APPROVED status correctly', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'APPROVED' },
    })
    expect(wrapper.text()).toBe('Approved')
  })

  it('formats REJECTED status correctly', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'REJECTED' },
    })
    expect(wrapper.text()).toBe('Rejected')
  })

  it('applies correct color classes for DRAFT', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'DRAFT' },
    })
    expect(wrapper.classes()).toContain('bg-blue-100')
    expect(wrapper.classes()).toContain('text-blue-700')
  })

  it('applies correct color classes for PENDING_APPROVAL', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'PENDING_APPROVAL' },
    })
    expect(wrapper.classes()).toContain('bg-amber-100')
    expect(wrapper.classes()).toContain('text-amber-700')
  })

  it('applies correct color classes for APPROVED', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'APPROVED' },
    })
    expect(wrapper.classes()).toContain('bg-green-100')
    expect(wrapper.classes()).toContain('text-green-700')
  })

  it('applies correct color classes for REJECTED', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'REJECTED' },
    })
    expect(wrapper.classes()).toContain('bg-red-100')
    expect(wrapper.classes()).toContain('text-red-700')
  })

  it('applies bordered styles when bordered prop is true', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'DRAFT', bordered: true },
    })
    expect(wrapper.classes()).toContain('border')
  })

  it('falls back to DRAFT styling for unknown status', () => {
    const wrapper = mount(StatusChip, {
      props: { status: 'UNKNOWN_STATUS' },
    })
    expect(wrapper.classes()).toContain('bg-blue-100')
    expect(wrapper.classes()).toContain('text-blue-700')
  })
})
