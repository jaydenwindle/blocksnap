# Generated by Django 4.0.2 on 2022-02-20 02:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_snapshot_rpc_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='snapshot',
            name='rpc_url',
            field=models.URLField(default='https://eth-mainnet.alchemyapi.io/v2/NGtUbewnL3eCvtxqJQr_biDfjQjPOCBD'),
        ),
    ]