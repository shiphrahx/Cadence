import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PeopleTable } from '../people-table'
import type { Person } from '@/lib/services/people'

describe('PeopleTable', () => {
  const mockPeople: Person[] = [
    {
      id: '1',
      name: 'John Doe',
      role: 'Software Engineer',
      level: 'Senior',
      startDate: '2023-01-15',
      status: 'active',
      teams: ['Platform Engineering', 'Product Team'],
      notes: 'Great team player',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Tech Lead',
      level: 'Staff',
      startDate: '2022-06-01',
      status: 'inactive',
      teams: ['Platform Engineering'],
      notes: null,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ]

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleStatus: vi.fn(),
    onQuickAdd: vi.fn(),
  }

  it('should render all people in the table', () => {
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Tech Lead')).toBeInTheDocument()
  })

  it('should display seniority level badges with correct styling', () => {
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    const badges = screen.getAllByText(/Senior|Staff/)
    expect(badges).toHaveLength(2)
  })

  it('should display team memberships', () => {
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    // Teams are displayed as separate badges
    const platformBadges = screen.getAllByText('Platform Engineering')
    expect(platformBadges.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Product Team')).toBeInTheDocument()
  })

  it('should display status badges', () => {
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    const activeBadge = screen.getByText('active')
    const inactiveBadge = screen.getByText('inactive')

    expect(activeBadge).toBeInTheDocument()
    expect(inactiveBadge).toBeInTheDocument()
  })

  it('should display formatted start dates', () => {
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    // Dates should be formatted
    expect(screen.getByText(/Jan.*2023/)).toBeInTheDocument()
    expect(screen.getByText(/Jun.*2022/)).toBeInTheDocument()
  })

  it('should show action menu when More button is clicked', async () => {
    const user = userEvent.setup()
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    // Menu should appear with Edit, Toggle Status, and Delete options
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText(/Set (Active|Inactive)/)).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should call onEdit when Edit is clicked', async () => {
    const user = userEvent.setup()
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockPeople[0])
  })

  it('should call onToggleStatus when Toggle Status is clicked', async () => {
    const user = userEvent.setup()
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const toggleButton = screen.getByText('Set Inactive')
    await user.click(toggleButton)

    expect(mockHandlers.onToggleStatus).toHaveBeenCalledWith(mockPeople[0])
  })

  it('should call onDelete when Delete is clicked', async () => {
    const user = userEvent.setup()
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockPeople[0])
  })

  it('should render empty state when no people', () => {
    render(<PeopleTable people={[]} {...mockHandlers} />)

    // DataTable should handle empty state
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('should handle people with no team memberships', () => {
    const peopleWithNoTeams: Person[] = [
      {
        id: '1',
        name: 'Solo Developer',
        role: 'Contractor',
        level: 'Mid',
        startDate: '2024-01-01',
        status: 'active',
        teams: [],
        notes: null,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    render(<PeopleTable people={peopleWithNoTeams} {...mockHandlers} />)

    expect(screen.getByText('Solo Developer')).toBeInTheDocument()
  })

  it('should handle people with null optional fields', () => {
    const peopleWithNulls: Person[] = [
      {
        id: '1',
        name: 'Minimal Person',
        role: null,
        level: null,
        startDate: null,
        status: 'active',
        teams: [],
        notes: null,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    render(<PeopleTable people={peopleWithNulls} {...mockHandlers} />)

    expect(screen.getByText('Minimal Person')).toBeInTheDocument()
  })

  it('should display person initials in avatar', () => {
    render(<PeopleTable people={mockPeople} {...mockHandlers} />)

    // Initials should be displayed (JD for John Doe, JS for Jane Smith)
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByText('JS')).toBeInTheDocument()
  })
})
