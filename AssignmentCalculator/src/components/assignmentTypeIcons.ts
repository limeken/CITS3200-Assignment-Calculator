import {
  BeakerIcon,
  BookOpenIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/solid';
import type { ComponentType, SVGProps } from 'react';

const fallback = DocumentTextIcon;

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  essay: DocumentTextIcon,
  report: DocumentTextIcon,
  quiz: RectangleGroupIcon,
  presentation: PresentationChartLineIcon,
  'lab-report': BeakerIcon,
  'lab_report': BeakerIcon,
  reflection: BookOpenIcon,
  reflective: BookOpenIcon,
};

const TITLE_TO_ICON: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'lab report': BeakerIcon,
  'reflective writing': BookOpenIcon,
  presentation: PresentationChartLineIcon,
};

export function getAssignmentTypeIcon(
  id: string,
  title?: string,
): ComponentType<SVGProps<SVGSVGElement>> {
  const key = id.trim().toLowerCase();
  if (ICONS[key]) return ICONS[key];
  const titleKey = title?.trim().toLowerCase();
  if (titleKey && TITLE_TO_ICON[titleKey]) return TITLE_TO_ICON[titleKey];
  return fallback;
}
