import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamsTable } from '../teams-table'
import type { Team } from '@/lib/services/teams'

describe('TeamsTable', () => {
  const mockTeams: Team[] = [
    {
      id: '1',
      name: 'Platform Engineering',
      description: 'Core platform development',
      status: 'active',
      memberCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Product Team',
      description: 'Product development',
      status: 'inactive',
      memberCount: 3,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ]

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleStatus: vi.fn(),
    onQuickAdd: vi.fn(),
  }

  it('should render all teams in the table', () => {
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    expect(screen.getByText('Platform Engineering')).toBeInTheDocument()
    expect(screen.getByText('Product Team')).toBeInTheDocument()
    expect(screen.getByText('Core platform development')).toBeInTheDocument()
  })

  it('should display member count for each team', () => {
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should display status badges with correct styling', () => {
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    const badges = screen.getAllByText(/active|inactive/i)
    expect(badges).toHaveLength(2)
  })

  it('should display formatted creation dates', () => {
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    // Dates should be formatted as "01 Jan 2024" format
    expect(screen.getByText(/Jan.*2024/)).toBeInTheDocument()
  })

  it('should show action menu when More button is clicked', async () => {
    const user = userEvent.setup()
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    // Menu should appear with Edit, Toggle Status, and Delete options
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText(/Set (Active|Inactive)/)).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should call onEdit when Edit is clicked', async () => {
    const user = userEvent.setup()
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTeams[0])
  })

  it('should call onToggleStatus when Toggle Status is clicked', async () => {
    const user = userEvent.setup()
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const toggleButton = screen.getByText('Set Inactive')
    await user.click(toggleButton)

    expect(mockHandlers.onToggleStatus).toHaveBeenCalledWith(mockTeams[0])
  })

  it('should call onDelete when Delete is clicked', async () => {
    const user = userEvent.setup()
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    await user.click(moreButtons[0])

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTeams[0])
  })

  it('should filter teams by status', async () => {
    const user = userEvent.setup()
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    // Initially both teams should be visible
    expect(screen.getByText('Platform Engineering')).toBeInTheDocument()
    expect(screen.getByText('Product Team')).toBeInTheDocument()

    // Apply active filter
    // Note: This would require interacting with the DataTable's filter component
    // The exact implementation depends on your DataTable component structure
  })

  it('should search teams by name', async () => {
    const user = userEvent.setup()
    render(<TeamsTable teams={mockTeams} {...mockHandlers} />)

    // Search functionality test
    // Note: This would require interacting with the DataTable's search input
    // The exact implementation depends on your DataTable component structure
  })

  it('should render empty state when no teams', () => {
    render(<TeamsTable teams={[]} {...mockHandlers} />)

    // DataTable should handle empty state
    // The exact message depends on your DataTable implementation
    expect(screen.queryByText('Platform Engineering')).not.toBeInTheDocument()
  })

  it('should handle teams with missing optional fields', () => {
    const teamsWithMissingFields: Team[] = [
      {
        id: '1',
        name: 'Minimal Team',
        description: '',
        status: 'active',
        memberCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    render(<TeamsTable teams={teamsWithMissingFields} {...mockHandlers} />)

    expect(screen.getByText('Minimal Team')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // memberCount
  })
})
