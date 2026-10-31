"""Utilidades de fechas compartidas por los servicios."""

from datetime import date, datetime, time


def start_of_day(value: date) -> datetime:
    """Devuelve la fecha a las 00:00:00."""
    return datetime.combine(value, time.min)


def end_of_day(value: date) -> datetime:
    """Devuelve la fecha al final del día con precisión de SQL Server datetime."""
    return datetime.combine(value, time(23, 59, 59, 997000))
