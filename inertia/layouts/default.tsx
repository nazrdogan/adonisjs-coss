import { Data } from '@generated/data'
import { usePage } from '@inertiajs/react'
import { ReactElement, useEffect } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import { AnchoredToastProvider, ToastProvider, toastManager } from '~/components/ui/toast'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
} from '~/components/ui/menu'
import {
  LogOut,
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  ChevronsUpDown,
  ExternalLink,
} from 'lucide-react'

function NavLink({
  route,
  href,
  children,
}: {
  route: string
  href: string
  children: React.ReactNode
}) {
  const { url } = usePage()
  const isActive = url.startsWith(href)

  return (
    <Link
      route={route as any}
      className={`text-sm font-medium transition-colors ${
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  useEffect(() => {}, [usePage().url])
  useEffect(() => {
    if (children.props.flash.error) {
      toastManager.add({
        type: 'error',
        title: 'Error',
        description: children.props.flash.error,
      })
    }
  }, [children.props.flash])

  const user = children.props.user

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b px-5">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link route="home" className="flex items-center gap-2">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L4 9h16L12 2z" fill="#6EE7B7" />
                <path d="M4 9l8 13 8-13H4z" fill="#10B981" />
                <path d="M8.5 9L12 2l3.5 7L12 22l-3.5-13z" fill="#059669" fillOpacity="0.3" />
              </svg>
              <span className="text-base font-bold tracking-tight">emerald</span>
            </Link>

            {user && (
              <nav className="hidden sm:flex items-center gap-6">
                <NavLink route="dashboard.index" href="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink route="dashboard.playground" href="/playground">
                  Playground
                </NavLink>
                <NavLink route="dashboard.docs" href="/docs">
                  Docs
                </NavLink>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Mobile nav links */}
                <nav className="flex sm:hidden items-center gap-1">
                  <Button variant="ghost" size="icon" render={<Link route="dashboard.index" />}>
                    <LayoutDashboard className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    render={<Link route={'dashboard.playground' as any} />}
                  >
                    <FlaskConical className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    render={<Link route={'dashboard.docs' as any} />}
                  >
                    <BookOpen className="size-4" />
                  </Button>
                </nav>

                <Menu>
                  <MenuTrigger className="cursor-pointer flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="size-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                      {user.fullName || user.email.split('@')[0]}
                    </span>
                    <ChevronsUpDown className="size-3.5 text-muted-foreground" />
                  </MenuTrigger>
                  <MenuPopup align="end" sideOffset={8} className="w-56">
                    <div className="flex items-center gap-3 px-2 py-2.5">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.fullName || user.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <MenuSeparator />

                    {/* Mobile-only nav links */}
                    <div className="sm:hidden">
                      <MenuItem render={<Link route="dashboard.index" />}>
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </MenuItem>
                      <MenuItem render={<Link route={'dashboard.playground' as any} />}>
                        <FlaskConical className="size-4" />
                        Playground
                      </MenuItem>
                      <MenuItem render={<Link route={'dashboard.docs' as any} />}>
                        <BookOpen className="size-4" />
                        Docs
                      </MenuItem>
                      <MenuSeparator />
                    </div>

                    <MenuItem render={<a href="/#endpoints" />}>
                      <ExternalLink className="size-4" />
                      API Reference
                    </MenuItem>
                    <MenuSeparator />
                    <Form route="session.destroy">
                      <MenuItem
                        variant="destructive"
                        render={<button type="submit" className="w-full" />}
                      >
                        <LogOut className="size-4" />
                        Log out
                      </MenuItem>
                    </Form>
                  </MenuPopup>
                </Menu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" render={<Link route="session.create" />}>
                  Log in
                </Button>
                <Button size="sm" render={<Link route="new_account.create" />}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <ToastProvider position="top-center">
        <AnchoredToastProvider>
          <main>{children}</main>
        </AnchoredToastProvider>
      </ToastProvider>
    </>
  )
}
