import {
  computed,
  inject,
  provide,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from "vue";

/** Internal injection: a form lock follows the component tree through Teleport. */
const internalFormLockKey: InjectionKey<ComputedRef<boolean>> =
  Symbol("cheese-form-lock");
const unlocked = computed(() => false);

export function useFormLock(): ComputedRef<boolean> {
  return inject(internalFormLockKey, unlocked);
}

/** A nested section can add a lock but cannot unlock a disabled parent form. */
export function provideFormLock(
  ownLock: MaybeRefOrGetter<boolean>,
): ComputedRef<boolean> {
  const inherited = useFormLock();
  const effective = computed(() => inherited.value || toValue(ownLock));
  provide(internalFormLockKey, effective);
  return effective;
}
