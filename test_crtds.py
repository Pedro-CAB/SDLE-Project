import pytest
from crdt.two_phase_set import TwoPhaseSet
from crdt.lww_register import LWWRegister, LWWElement

# Testing the enhanced LWW Register

def test_lww_register_update_quantity():
    lww_reg = LWWRegister()
    lww_reg.update("quantity", 5, 1)
    assert lww_reg.get_value("quantity") == 5

def test_lww_register_update_checked():
    lww_reg = LWWRegister()
    lww_reg.update("checked", True, 2)
    assert lww_reg.get_value("checked") is True

def test_lww_register_update_with_later_timestamp():
    lww_reg = LWWRegister()
    lww_reg.update("quantity", 3, 3)
    lww_reg.update("quantity", 10, 5)  # Later timestamp
    assert lww_reg.get_value("quantity") == 10

def test_lww_register_ignore_older_update():
    lww_reg = LWWRegister()
    lww_reg.update("checked", True, 4)
    lww_reg.update("checked", False, 3)  # Older timestamp
    assert lww_reg.get_value("checked") is True

def test_lww_register_merge():
    reg1 = LWWRegister()
    reg2 = LWWRegister()
    reg1.update("quantity", 7, 6)
    reg2.update("quantity", 2, 8)
    reg1.merge(reg2)
    assert reg1.get_value("quantity") == 2

def test_lww_register_merge_multiple_fields():
    reg1 = LWWRegister()
    reg2 = LWWRegister()
    reg1.update("quantity", 5, 10)
    reg1.update("checked", False, 9)
    reg2.update("quantity", 3, 7)
    reg2.update("checked", True, 11)
    reg1.merge(reg2)
    assert reg1.get_value("quantity") == 5
    assert reg1.get_value("checked") is True
