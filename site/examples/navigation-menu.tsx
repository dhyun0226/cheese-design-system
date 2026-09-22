import {
  NavigationMenuRoot,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@cheese/react";
export default function Example() {
  return (
    <NavigationMenuRoot aria-label="업무 서비스">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>평가 관리</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#/components/table">
              평가 목록
            </NavigationMenuLink>
            <NavigationMenuLink href="#/components/calendar">
              평가 일정
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>조직</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#/components/tree">
              조직도
            </NavigationMenuLink>
            <NavigationMenuLink href="#/components/avatar">
              구성원
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#/getting-started">
            사용 안내
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuRoot>
  );
}
