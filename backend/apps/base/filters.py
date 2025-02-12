import django_filters as filters

class BaseFilterOrderBy(filters.FilterSet):
    """
        Define a default filter-class and
        will use everywhere where required order by
    """

    order_by = filters.CharFilter(method='order_by_filter')

    def order_by_filter(self, qs, name, value) -> object:
        return qs.order_by(value)
