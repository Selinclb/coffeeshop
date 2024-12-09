from django.contrib import admin
from unfold.admin import ModelAdmin
from settings.models import ContactInfo, About, TeamMember, FAQ, Settings
from unfold.admin import ModelAdmin, TabularInline
from tinymce.widgets import TinyMCE
from coffee_site.settings import TINYMCE_DEFAULT_CONFIG

class TeamMemberInline(TabularInline):
    model = TeamMember
    extra = 1

@admin.register(About)
class AboutAdmin(ModelAdmin):
    list_display = ['description', 'detail']
    inlines = [TeamMemberInline]

@admin.register(ContactInfo)
class ContactInfoAdmin(ModelAdmin):
    list_display = ('email', 'phone')

    def has_add_permission(self, request):
        # Sadece bir tane iletişim bilgisi olabilir.
        if self.model.objects.exists():
            return False
        return True
    

@admin.register(FAQ)
class FAQAdmin(ModelAdmin):
    list_display = ['question', 'answer', 'order']
    list_editable = ['order']
    search_fields = ['question', 'answer']
    ordering = ['order']


@admin.register(Settings)
class SettingsAdmin(ModelAdmin):
    list_display = ['title','shipping_cost','free_shipping_threshold']
    
    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name in ['shop_policy', 'shipping_returns']:
            return db_field.formfield(widget=TinyMCE(
                attrs={'cols': 80, 'rows': 30},
                mce_attrs=TINYMCE_DEFAULT_CONFIG
            ))
        return super().formfield_for_dbfield(db_field, **kwargs)
    