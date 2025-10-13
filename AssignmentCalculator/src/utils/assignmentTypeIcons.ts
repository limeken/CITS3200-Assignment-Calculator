import type { ComponentType, SVGProps } from 'react';
import {
  DocumentTextIcon,
  PresentationChartLineIcon,
  BeakerIcon,
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/solid';

const ICON_COMPONENTS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  DocumentTextIcon,
  PresentationChartLineIcon,
  BeakerIcon,
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
};

const DEFAULT_ICON = DocumentTextIcon;

export const getAssignmentIcon = (
  iconName?: string | null,
): ComponentType<SVGProps<SVGSVGElement>> => {
  if (!iconName) {
    return DEFAULT_ICON;
  }
  return ICON_COMPONENTS[iconName] ?? DEFAULT_ICON;
};
